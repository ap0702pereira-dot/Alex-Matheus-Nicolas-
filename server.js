
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const arquivo = path.join(__dirname, 'data', 'reservas.json');

function lerReservas() {
    return JSON.parse(fs.readFileSync(arquivo, 'utf8'));
}

function salvarReservas(reservas) {
    fs.writeFileSync(arquivo, JSON.stringify(reservas, null, 2));
}

// Login do administrador
app.post('/api/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === 'admin' && senha === 'admin123') {
        return res.json({
            usuario: {
                nome: 'Administrador',
                perfil: 'admin'
            }
        });
    }

    res.status(401).json({ erro: 'Login incorreto.' });
});

// Consultar reservas
app.get('/api/reservas', (req, res) => {
    res.json(lerReservas());
});

// Cadastrar reservas
app.post('/api/reservas', (req, res) => {
    const { professor, serie, dia, horario } = req.body;

    if (!professor || !serie || !dia || !horario) {
        return res.status(400).json({
            erro: 'Preencha todos os campos.'
        });
    }

    const reservas = lerReservas();

    const conflito = reservas.some(r =>
        r.dia === dia && r.horario === horario
    );

    if (conflito) {
        return res.status(409).json({
            erro: 'Horário já reservado.'
        });
    }

    const novaReserva = {
        id: Date.now(),
        professor,
        serie,
        dia,
        horario
    };

    reservas.push(novaReserva);
    salvarReservas(reservas);

    res.status(201).json({
        mensagem: 'Reserva cadastrada com sucesso!'
    });
});

// Excluir reservas
app.delete('/api/reservas/:id', (req, res) => {
    const id = Number(req.params.id);
    const reservas = lerReservas();

    const novas = reservas.filter(r => r.id !== id);

    if (novas.length === reservas.length) {
        return res.status(404).json({
            erro: 'Reserva não encontrada.'
        });
    }

    salvarReservas(novas);
    res.json({ mensagem: 'Reserva excluída!' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

