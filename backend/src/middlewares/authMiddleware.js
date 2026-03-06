const jwt = require('jsonwebtoken');

const authMiddleware = (allowedRoles = []) => {
    return (req, res, next) => {
        // 1. Verifica se o frontend enviou o cabeçalho de autorização
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.error("❌ BARRADO: React não enviou o crachá (Header ausente)");
            return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
        }

        // 2. Verifica se o formato é "Bearer <token>"
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            console.error("❌ BARRADO: Formato do crachá inválido");
            return res.status(401).json({ error: 'Acesso negado. Formato de token inválido.' });
        }

        const token = parts[1];

        // 3. Valida a autenticidade do crachá usando a sua senha secreta
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Verifica se o cargo do usuário tem permissão para esta rota específica
            if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
                console.error(`❌ BARRADO: Usuário '${decoded.email}' (Nível: ${decoded.role}) tentou acessar área restrita.`);
                return res.status(403).json({ error: 'Acesso negado. Nível de permissão insuficiente.' });
            }

            // 5. Crachá válido e cargo correto! Deixa passar e anota quem é o usuário.
            req.user = decoded;
            return next();
            
        } catch (error) {
            console.error("❌ BARRADO: O crachá é inválido, foi adulterado ou expirou.", error.message);
            return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
        }
    };
};

module.exports = authMiddleware;