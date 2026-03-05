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
const nodemailer = require('nodemailer'); 
const imaps = require('imap-simple'); // CORREÇÃO: Importação do IMAP adicionada aqui
const { simpleParser } = require('mailparser');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Multer (Upload de Imagens)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// =================================================================================
// CONFIGURAÇÃO DO DISPARADOR DE E-MAILS (NODEMAILER) COM PROTEÇÃO
// =================================================================================
let transporter = null;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 465,
        secure: process.env.SMTP_PORT == 465, 
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    transporter.verify(function (error, success) {
        if (error) {
            console.log("⚠️ Aviso SMTP: Falha ao conectar. Verifique as senhas no .env.");
        } else {
            console.log("✅ Nodemailer: Servidor SMTP pronto para enviar e-mails.");
        }
    });
} else {
    console.log("⚠️ Aviso SMTP: Credenciais de e-mail não encontradas no .env. O envio de e-mails está desativado.");
}

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
    } catch (err) {
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
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
// 2. MÓDULO DE INSTALAÇÕES (UPLOAD DE IMAGENS)
// =================================================================================

app.post('/api/facilities', authMiddleware(['super_usuario', 'admin']), upload.single('image'), async (req, res) => {
    try {
        const { caption } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

        // Correção no gerador de nome de arquivo (evita erros com caracteres especiais)
        const fileExt = file.originalname.split('.').pop();
        const safeHash = Math.random().toString(36).substring(2, 10);
        const fileName = `facility_${Date.now()}_${safeHash}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });
        
        if (uploadError) {
            console.error("Erro Supabase Storage:", uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);

        const { error: dbError } = await supabase.from('facilities').insert([{ image_url: publicUrl, caption: caption || 'Instalação' }]);
        if (dbError) throw dbError;

        res.json({ message: 'Foto adicionada com sucesso!', url: publicUrl });
    } catch (error) {
        console.error("Erro no Upload:", error);
        res.status(500).json({ error: 'Erro ao fazer upload da imagem.' });
    }
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
        const cleanNome = xss(nome);
        const cleanEmail = xss(email);
        const cleanMensagem = xss(mensagem);

        const { error: dbError } = await supabase.from('messages').insert([{ 
            sender_name: cleanNome, 
            sender_email: cleanEmail, 
            message_body: cleanMensagem, 
            status: 'pendente' 
        }]);
        
        if (dbError) throw dbError;

        if (transporter) {
            const mailOptions = {
                from: `"${cleanNome} (Via Site)" <${process.env.SMTP_USER}>`, 
                replyTo: cleanEmail, 
                to: process.env.RECEIVER_EMAIL || process.env.SMTP_USER, 
                subject: `Novo Contato do Site: ${cleanNome}`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-top: 5px solid #c5a47e;">
                        <h2 style="color: #1a202c;">Nova Mensagem Recebida</h2>
                        <p>Você recebeu um novo contato através do site Parrela Medicina Ocupacional.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p><strong>Nome do Cliente:</strong> ${cleanNome}</p>
                        <p><strong>E-mail:</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
                        <p><strong>Mensagem:</strong></p>
                        <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; border: 1px solid #eee; white-space: pre-wrap;">
                            ${cleanMensagem}
                        </div>
                    </div>
                `
            };
            transporter.sendMail(mailOptions).catch(err => console.error("Falha ao enviar e-mail de aviso:", err));
        }

        res.json({ message: 'Mensagem enviada com sucesso!' });
    } catch (error) { 
        res.status(500).json({ error: 'Erro ao processar mensagem.' }); 
    }
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
    const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
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
// 5. MÓDULO DE CONFIGURAÇÕES E BLOG
// =================================================================================

app.get('/api/config', async (req, res) => {
    const { data } = await supabase.from('site_config').select('*').single();
    res.json(data || {});
});

app.put('/api/config', authMiddleware(['super_usuario', 'admin']), async (req, res) => {
    const { error } = await supabase.from('site_config').update(req.body).eq('id', 1);
    if (error) return res.status(400).json(error);
    res.json({ message: 'Configurações atualizadas' });
});

app.post('/api/blog', authMiddleware(['super_usuario', 'admin']), upload.single('image'), async (req, res) => {
    try {
        const { title, content, image_url } = req.body;
        let finalImageUrl = image_url;

        if (req.file) {
            const fileExt = req.file.originalname.split('.').pop();
            const fileName = `blog_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('images').upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
            if (uploadError) throw uploadError;
            const { data: publicUrlData } = supabase.storage.from('images').getPublicUrl(fileName);
            finalImageUrl = publicUrlData.publicUrl;
        }

        const cleanContent = xss(content); 
        const { error: dbError } = await supabase.from('blog_posts').insert([{ title, content: cleanContent, image_url: finalImageUrl, author_id: req.user.id }]);
        if (dbError) throw dbError;
        res.json({ message: 'Post criado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar postagem.' });
    }
});

app.get('/api/blog', async (req, res) => {
    const { data } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
    res.json(data);
});

app.get('/api/blog/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('blog_posts').select('*').eq('id', req.params.id).single();
        if (error) return res.status(404).json({ error: 'Post não encontrado.' });
        res.json(data);
    } catch (error) { res.status(500).json({ error: 'Erro ao buscar post.' }); }
});

// =================================================================================
// 6. MÓDULO DE CAIXA DE ENTRADA (LEITURA E DELEÇÃO IMAP REAL)
// =================================================================================

app.get('/api/emails', authMiddleware(['super_usuario', 'admin', 'operacional']), async (req, res) => {
    if (!process.env.IMAP_USER || !process.env.IMAP_PASS) {
        return res.status(500).json({ error: "Credenciais IMAP não configuradas no .env" });
    }

    const config = {
        imap: {
            user: process.env.IMAP_USER,
            password: process.env.IMAP_PASS,
            host: process.env.IMAP_HOST,
            port: process.env.IMAP_PORT || 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            authTimeout: 10000
        }
    };

    try {
        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        const searchCriteria = ['ALL'];
        const fetchOptions = { bodies: [''], markSeen: false };

        const messages = await connection.search(searchCriteria, fetchOptions);
        const recentMessages = messages.slice(-15).reverse();

        const emails = await Promise.all(recentMessages.map(async item => {
            const all = item.parts.find(part => part.which === '').body;
            const parsed = await simpleParser(all);
            
            return {
                id: item.attributes.uid,
                subject: parsed.subject || 'Sem Assunto',
                from: parsed.from ? parsed.from.text : 'Desconhecido',
                date: parsed.date ? new Date(parsed.date).toLocaleString('pt-BR') : '',
                text: parsed.text || 'E-mail sem conteúdo em texto.',
                html: parsed.html || null
            };
        }));

        connection.end(); 
        res.json(emails);

    } catch (error) {
        console.error("Erro IMAP ao ler e-mails:", error);
        res.status(500).json({ error: 'Erro ao conectar à caixa de e-mails.' });
    }
});

app.delete('/api/emails/:id', authMiddleware(['super_usuario', 'admin', 'operacional']), async (req, res) => {
    if (!process.env.IMAP_USER || !process.env.IMAP_PASS) {
        return res.status(500).json({ error: "Credenciais IMAP ausentes." });
    }

    const config = {
        imap: {
            user: process.env.IMAP_USER,
            password: process.env.IMAP_PASS,
            host: process.env.IMAP_HOST,
            port: process.env.IMAP_PORT || 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            authTimeout: 10000
        }
    };

    try {
        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        const uid = parseInt(req.params.id, 10);
        await connection.addFlags(uid, '\\Deleted');
        
        connection.imap.expunge((err) => {
            connection.end();
            if (err) return res.status(500).json({ error: 'Erro ao apagar definitivamente no servidor.' });
            res.json({ message: 'E-mail excluído com sucesso do servidor.' });
        });

    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir o e-mail via IMAP.' });
    }
});

// Se não estiver na Vercel (ou seja, está no seu PC), ele liga a porta 5000
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Servidor rodando localmente na porta ${PORT}`));
}

// Exporta o app para a Vercel usar a arquitetura Serverless dela
module.exports = app;