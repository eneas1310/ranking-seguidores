// --- INÍCIO DO ARQUIVO gerar-stats.js ---

const fs = require('fs');
const path = require('path');

// IMPORTANTE: LISTA DE DATAS DOS RANKINGS
// Para adicionar um novo ranking, basta adicionar a data aqui no formato 'AAAA-MM-DD'
const dates = [
    '2025-10-15',
    '2025-10-14',
    '2025-10-13'
];

const playerStats = {};

console.log('Iniciando cálculo do Hall da Fama...');

// 1. Lê todos os arquivos de ranking
dates.forEach(date => {
    const filePath = path.join(__dirname, `ranking_${date}.json`);
    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const dailyRanking = JSON.parse(fileContent);

            // 2. Processa e soma os dados de cada dia
            dailyRanking.forEach(player => {
                const username = player.username;
                if (!playerStats[username]) {
                    playerStats[username] = {
                        username: username,
                        totalKills: 0,
                        wins: 0,
                        podiums: 0,
                        participations: 0,
                        imageUrl: player.imageUrl
                    };
                }

                playerStats[username].totalKills += player.eliminatedCount;
                playerStats[username].participations++;
                if (player.rank === 1) playerStats[username].wins++;
                if (player.rank <= 3) playerStats[username].podiums++;
            });
            console.log(`- Arquivo ranking_${date}.json processado com sucesso.`);
        } else {
            console.warn(`- AVISO: Arquivo ranking_${date}.json não encontrado. Pulando...`);
        }
    } catch (error) {
        console.error(`- ERRO ao processar o arquivo ranking_${date}.json:`, error);
    }
});

const fullStatsList = Object.values(playerStats);

// 3. Prepara os dados finais para salvar
const finalStats = {
    topKillers: [...fullStatsList].sort((a, b) => b.totalKills - a.totalKills).slice(0, 10),
    topWinners: [...fullStatsList].sort((a, b) => b.wins - a.wins).slice(0, 10),
    topPodiums: [...fullStatsList].sort((a, b) => b.podiums - a.podiums).slice(0, 10),
};

// 4. Salva o arquivo de resumo
const outputFilePath = path.join(__dirname, 'hall_of_fame_stats.json');
fs.writeFileSync(outputFilePath, JSON.stringify(finalStats, null, 2));

console.log('\n✅ Arquivo "hall_of_fame_stats.json" gerado com sucesso!');
// --- FIM DO ARQUIVO gerar-stats.js ---