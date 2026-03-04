const jwt = require('jsonwebtoken');

const authMiddleware = (requiredRoles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // Se nenhuma role for exigida, apenas autentica
            if (requiredRoles.length === 0) {
                return next();
            }

            // Verifica hierarquia ou permissão específica
            if (requiredRoles.includes(decoded.role)) {
                return next();
            } else {
                return res.status(403).json({ error: 'Acesso negado: Permissão insuficiente' });
            }

        } catch (err) {
            return res.status(401).json({ error: 'Token inválido' });
        }
    };
};

module.exports = authMiddleware;