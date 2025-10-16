const fs = require('fs');
const path = require('path');

const historicoPath = path.join(__dirname, '..', 'data', 'historico_batalhas.json');
const stats = {};

// Verifica se o arquivo de histórico existe
if (!fs.existsSync(historicoPath)) {
    console.log("Arquivo de histórico não encontrado. Criando um Hall da Fama vazio.");
    
    const emptyStats = {
        topKillers: [],
        topPodiums: []
    };
    
    fs.writeFileSync(
        path.join(__dirname, '..', 'data', 'hall_of_fame_stats.json'),
        JSON.stringify(emptyStats, null, 2)
    );

} else {
    const historico = JSON.parse(fs.readFileSync(historicoPath, 'utf-8'));

    historico.forEach(batalha => {
        batalha.rankingFinal.forEach((player, index) => {
            if (!stats[player.username]) {
                stats[player.username] = {
                    username: player.username,
                    totalKills: 0,
                    wins: 0,
                    podiums: 0,
                    participations: 0,
                    imageUrl: player.imageUrl // Pega a URL da imagem da última participação
                };
            }
            const pStats = stats[player.username];
            pStats.totalKills += player.kills;
            pStats.participations++;

            if (index === 0) {
                pStats.wins++;
                pStats.podiums++;
            } else if (index === 1 || index === 2) {
                pStats.podiums++;
            }
        });
    });

    const allPlayers = Object.values(stats);

    // Ordena por Kills
    const topKillers = [...allPlayers]
        .sort((a, b) => b.totalKills - a.totalKills || b.wins - a.wins)
        .slice(0, 10);

    // Ordena por Pódios
    const topPodiums = [...allPlayers]
        .filter(p => p.podiums > 0)
        .sort((a, b) => b.podiums - a.podiums || b.totalKills - a.totalKills)
        .slice(0, 10);
    
    const hallOfFameStats = {
        topKillers,
        topPodiums,
    };
    
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'hall_of_fame_stats.json'), JSON.stringify(hallOfFameStats, null, 2));

    console.log('Estatísticas do Hall da Fama geradas com sucesso!');
}