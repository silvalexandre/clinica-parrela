const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('./config/supabase');
const authMiddleware = require('./middlewares/authMiddleware');

// Bibliotecas de Utilitários e Segurança
const multer = require('multer'); 
const xss = require('xss');       
const validator = require('validator'); 
const imaps = require('imap-simple'); 
const { simpleParser } = require('mailparser');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Configuração do Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// =================================================================================
// 1. MÓDULO DE AUTENTICAÇÃO
// =================================================================================

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
        if (error || !user) return res.status(404).json({ error: 'Usuário não encontrado' });

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) return res.status(401).json({ error: 'Senha incorreta' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.full_name },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, user: { id: user.id, name: user.full_name, role: user.role, email: user.email } });
    } catch (err) { res.status(500).json({ error: 'Erro interno no servidor' }); }
});

app.post('/api/auth/register', authMiddleware(['super_usuario']), async (req, res) => {
    const { email, password, full_name, role } = req.body;
    if (!email || !password || !full_name) return res.status(400).json({ error: 'Todos os campos são obrigatórios' });

    try {
        const hash = await bcrypt.hash(password, 10);
        const { error } = await supabase.from('users').insert([{ email, password_hash: hash, full_name, role: role || 'operacional' }]);
        if (error) throw error;
        res.json({ message: 'Usuário criado com sucesso' });
    } catch (error) { res.status(400).json({ error: error.message }); }
});

app.post('/api/auth/setup-admin', async (req, res) => {
    const { email, password, full_name } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const { error } = await supabase.from('users').insert([{ email, password_hash: hash, full_name, role: 'super_usuario' }]);
        if (error) throw error;
        res.json({ message: 'Super Usuário criado com sucesso' });
    } catch (error) { res.status(400).json({ error: error.message }); }
});

// =================================================================================
// 2. MÓDULO DE INSTALAÇÕES
// =================================================================================

app.post('/api/facilities', authMiddleware(['super_usuario', 'admin']), upload.single('image'), async (req, res) => {
    try {
        const { caption } = req.body;
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

        const fileExt = file.originalname.split('.').pop();
        const fileName = `facility_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file.buffer, { contentType: file.mimetype });
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);

        const { error: dbError } = await supabase.from('facilities').insert([{ image_url: publicUrl, caption: caption || 'Instalação' }]);
        if (dbError) throw dbError;

        res.json({ message: 'Foto adicionada com sucesso!', url: publicUrl });
    } catch (error) { res.status(500).json({ error: 'Erro ao fazer upload.' }); }
});

app.get('/api/facilities', async (req, res) => {
    try {
        const { data, error } = await supabase.from('facilities').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar fotos' }); }
});

app.delete('/api/facilities/:id', authMiddleware(['super_usuario', 'admin']), async (req, res) => {
    try {
        const { error } = await supabase.from('facilities').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'Foto removida.' });
    } catch (error) { res.status(400).json({ error: error.message }); }
});

// =================================================================================
// 3. MÓDULO DE USUÁRIOS
// =================================================================================

app.get('/api/users', authMiddleware(['super_usuario']), async (req, res) => {
    try {
        const { data, error } = await supabase.from('users').select('id, full_name, email, role, created_at').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) { res.status(500).json({ error: 'Erro ao listar usuários.' }); }
});

app.delete('/api/users/:id', authMiddleware(['super_usuario']), async (req, res) => {
    try {
        if (req.user.id === req.params.id) return res.status(400).json({ error: 'Não pode excluir a si mesmo.' });
        const { error } = await supabase.from('users').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'Usuário removido.' });
    } catch (error) { res.status(500).json({ error: 'Erro ao excluir usuário.' }); }
});

// =================================================================================
// 4. MÓDULO DE MENSAGENS E CONTATO
// =================================================================================

app.post('/api/public/contact', async (req, res) => {
    const { nome, email, mensagem } = req.body;
    if (!nome || !email || !mensagem) return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    if (!validator.isEmail(email)) return res.status(400).json({ error: 'E-mail inválido.' });

    try {
        const { error } = await supabase.from('messages').insert([{ 
            sender_name: xss(nome), sender_email: xss(email), message_body: xss(mensagem), status: 'pendente' 
        }]);
        if (error) throw error;
        res.json({ message: 'Mensagem enviada com segurança!' });
    } catch (error) { res.status(500).json({ error: 'Erro ao processar mensagem.' }); }
});

app.get('/api/messages/stats', authMiddleware(['super_usuario', 'admin', 'operacional']), async (req, res) => {
    try {
        const { data: allMessages } = await supabase.from('messages').select('status');
        const total = allMessages.length;
        const respondidas = allMessages.filter(m => m.status === 'respondido').length;
        const pendentes = allMessages.filter(m => m.status === 'pendente').length;
        const contratos = allMessages.filter(m => m.status === 'contrato_fechado').length;
        let alertLevel = pendentes > 10 ? 'red' : (pendentes > 5 ? 'orange' : 'green');
        res.json({ stats: { total, respondidas, pendentes, contratos }, alertLevel });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/messages', authMiddleware(['super_usuario', 'admin', 'operacional']), async (req, res) => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    res.json(data || []);
});

app.patch('/api/messages/:id', authMiddleware(['super_usuario', 'admin']), async (req, res) => {
    const { error } = await supabase.from('messages').update({ status: req.body.status }).eq('id', req.params.id);
    if (error) return res.status(400).json(error);
    res.json({ message: 'Status atualizado' });
});

app.delete('/api/messages/:id', authMiddleware(['super_usuario', 'admin']), async (req, res) => {
    const { error } = await supabase.from('messages').delete().eq('id', req.params.id);
    if (error) return res.status(400).json(error);
    res.json({ message: 'Mensagem excluída' });
});

// =================================================================================
// 5. MÓDULO DE CONFIGURAÇÕES E BLOG (ATUALIZADO PARA VERCEL)
// =================================================================================

app.get('/api/config', async (req, res) => {
    const { data } = await supabase.from('site_config').select('*').limit(1);
    res.json(data && data.length > 0 ? data[0] : {});
});

app.put('/api/config', authMiddleware(['super_usuario', 'admin']), async (req, res) => {
    try {
        const { data: existing } = await supabase.from('site_config').select('id').limit(1);
        if (existing && existing.length > 0) {
            await supabase.from('site_config').update(req.body).eq('id', existing[0].id);
        } else {
            await supabase.from('site_config').insert([req.body]);
        }
        res.json({ message: 'Configurações atualizadas' });
    } catch (error) { res.status(500).json({ error: 'Erro ao salvar config' }); }
});

// Criar Blog Post
app.post('/api/blog', authMiddleware(['super_usuario', 'admin']), upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        let finalImageUrl = null;

        if (req.file) {
            const fileName = `blog_${Date.now()}.${req.file.originalname.split('.').pop()}`;
            await supabase.storage.from('images').upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
            finalImageUrl = publicUrlData.publicUrl;
        }

        await supabase.from('blog_posts').insert([{ 
            title, content: xss(content), image_url: finalImageUrl, 
            author_id: req.user.id, published_at: new Date() 
        }]);
        res.json({ message: 'Post criado com sucesso!' });
    } catch (error) { res.status(500).json({ error: 'Erro ao criar postagem.' }); }
});

// Editar Blog Post (Sem exigir updated_at)
app.put('/api/blog/:id', authMiddleware(['super_usuario', 'admin']), upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        let updateData = { title, content: xss(content) };

        if (req.file) {
            const fileName = `blog_edit_${Date.now()}.${req.file.originalname.split('.').pop()}`;
            await supabase.storage.from('images').upload(fileName, req.file.buffer, { contentType: req.file.mimetype });
            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
            updateData.image_url = publicUrlData.publicUrl;
        }

        const { error } = await supabase.from('blog_posts').update(updateData).eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'Postagem atualizada!' });
    } catch (error) { res.status(500).json({ error: 'Erro na edição.' }); }
});

// Listar Todos os Posts
app.get('/api/blog', async (req, res) => {
    const { data } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
    res.json(data || []);
});

// Ler Um Post Específico
app.get('/api/blog/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('blog_posts').select('*').eq('id', req.params.id).single();
        if (error) return res.status(404).json({ error: 'Post não encontrado.' });
        res.json(data);
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar post.' }); }
});

// Deletar Post
app.delete('/api/blog/:id', authMiddleware(['super_usuario', 'admin']), async (req, res) => {
    await supabase.from('blog_posts').delete().eq('id', req.params.id);
    res.json({ message: 'Post removido.' });
});


// =================================================================================
// 6. MÓDULO EMAILS (IMAP REAL)
// =================================================================================

app.get('/api/emails', authMiddleware(['super_usuario', 'admin', 'operacional']), async (req, res) => {
    console.log("Variável do Host lida do .env:", process.env.IMAP_HOST);
    const config = {
        imap: {
            user: process.env.IMAP_USER, 
            password: process.env.IMAP_PASS,
            host: process.env.IMAP_HOST, 
            port: 993, 
            tls: true, 
            tlsOptions: { rejectUnauthorized: false }
        }
    };

    try {
        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');
        const messages = await connection.search(['ALL'], { bodies: [''], markSeen: false });
        
        const emails = await Promise.all(messages.slice(-15).reverse().map(async item => {
            const bodyPart = item.parts.find(part => part.which === '');
            const parsed = await simpleParser(bodyPart.body);
            return {
                id: item.attributes.uid,
                subject: parsed.subject,
                from: parsed.from.text,
                date: parsed.date,
                body: parsed.textAsHtml || parsed.text
            };
        }));
        
        connection.end();
        res.json(emails);
    } catch (err) {
        // O FOFOQUEIRO DO TERMINAL: Vai mostrar o erro cru da Hostinger
        console.error("❌ ERRO IMAP REAL DIRETO DO SERVIDOR:", err);
        res.status(500).json({ error: 'Falha na autenticação do E-mail. Olhe o terminal do VS Code!' });
    }
});

// Rota para deletar um e-mail específico pelo UID
app.delete('/api/emails/:uid', authMiddleware(['super_usuario', 'admin', 'operacional']), async (req, res) => {
    const uid = req.params.uid;
    const config = {
        imap: {
            user: process.env.IMAP_USER,
            password: process.env.IMAP_PASS,
            host: process.env.IMAP_HOST,
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false }
        }
    };

    try {
        const connection = await imaps.connect(config);
        
        // Abre a caixa de entrada permitindo edições (readOnly: false é o padrão)
        await connection.openBox('INBOX');
        
        // 1. Marca o e-mail específico com a flag de deletado
        await connection.addFlags(uid, '\\Deleted');
        
        // 2. Executa a limpeza (expunge) para remover permanentemente do servidor
        connection.imap.expunge(() => {
            connection.end();
            res.json({ message: 'E-mail apagado permanentemente do servidor!' });
        });

    } catch (err) {
        console.error("❌ ERRO AO APAGAR E-MAIL:", err);
        res.status(500).json({ error: 'Falha ao deletar o e-mail na Hostinger.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));

// A MÁGICA DA VERCEL: Exportar o app em vez de apenas rodar localmente
module.exports = app;