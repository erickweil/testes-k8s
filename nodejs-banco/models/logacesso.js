const mongoose = require('mongoose');

const acessoSchema = new mongoose.Schema({
    ip: String,
    user_agent: String,
    path: String,
    data: { type: Date, default: Date.now}
}, { collection: 'acesso' }
);

module.exports = mongoose.model('acesso', acessoSchema, 'acesso');
