const fs = require('fs');
const path = require('path');

const diretorioAtual = __dirname;
const statsDir = path.join(diretorioAtual, 'stats');

// Cria a pasta /stats/ se ela não existir
if (!fs.existsSync(statsDir)) {
    fs.mkdirSync(statsDir);
}

// --- Lógica Principal ---

async function processarTodosOsRankings() {
    console.log('Iniciando processamento de todos os dados...');
    try {
        const arquivos = fs.readdirSync(diretorioAtual);
        const arquivosDeRanking = arquivos.filter(file => file.startsWith('ranking_') && file.endsWith('.json')).sort();

        if (arquivosDeRanking.length === 0) {
            throw new Error("Nenhum arquivo de ranking encontrado.");
        }

        const masterStats = {};

        // 1. Agrega todos os dados de todas as rodadas
        for (const arquivo of arquivosDeRanking) {
            const dateMatch = arquivo.match(/ranking_(\d{4}-\d{2}-\d{2})\.json/);
            if (!dateMatch) continue;
            const dataDaRodada = dateMatch[1];

            const conteudo = fs.readFileSync(path.join(diretorioAtual, arquivo), 'utf-8');
            const dadosDoDia = JSON.parse(conteudo);

            for (const jogador of dadosDoDia) {
                const username = jogador.username;

                if (!masterStats[username]) {
                    masterStats[username] = {
                        username: username,
                        imageUrl: jogador.imageUrl,
                        historicoDeBatalhas: [],
                        maioresVitimas: {},
                        maioresCarrascos: {}
                    };
                }
                
                masterStats[username].imageUrl = jogador.imageUrl;

                masterStats[username].historicoDeBatalhas.push({
                    date: dataDaRodada,
                    rank: jogador.rank,
                    eliminatedCount: jogador.eliminatedCount,
                    eliminatedBy: jogador.eliminatedBy
                });

                // ### CORREÇÃO AQUI ###
                // Adicionamos uma verificação para garantir que a lista de vítimas existe antes de tentar lê-la.
                if (jogador.eliminatedList && Array.isArray(jogador.eliminatedList)) {
                    jogador.eliminatedList.forEach(vitima => {
                        masterStats[username].maioresVitimas[vitima] = (masterStats[username].maioresVitimas[vitima] || 0) + 1;
                    });
                }

                if (jogador.eliminatedBy !== 'Sobrevivente') {
                    const carrasco = jogador.eliminatedBy;
                    masterStats[username].maioresCarrascos[carrasco] = (masterStats[username].maioresCarrascos[carrasco] || 0) + 1;
                }
            }
        }

        // 2. Processa os dados agregados para criar os arquivos de perfil
        for (const username in masterStats) {
            const stats = masterStats[username];

            const totalEliminacoes = stats.historicoDeBatalhas.reduce((sum, b) => sum + b.eliminatedCount, 0);
            const totalParticipacoes = stats.historicoDeBatalhas.length;
            const somaDosRanks = stats.historicoDeBatalhas.reduce((sum, b) => sum + b.rank, 0);
            
            let melhorBatalha = stats.historicoDeBatalhas.reduce((best, current) => current.rank < best.rank ? current : best);
            let piorBatalha = stats.historicoDeBatalhas.reduce((worst, current) => current.rank > worst.rank ? current : worst);

            const perfilJogador = {
                username: stats.username,
                imageUrl: stats.imageUrl,
                totalParticipacoes: totalParticipacoes,
                totalEliminacoes: totalEliminacoes,
                mediaRank: (somaDosRanks / totalParticipacoes).toFixed(2),
                mediaEliminacoes: (totalEliminacoes / totalParticipacoes).toFixed(2),
                melhorRank: { rank: melhorBatalha.rank, date: melhorBatalha.date },
                piorRank: { rank: piorBatalha.rank, date: piorBatalha.date },
                maioresVitimas: Object.entries(stats.maioresVitimas).sort((a, b) => b[1] - a[1]).slice(0, 10),
                maioresCarrascos: Object.entries(stats.maioresCarrascos).sort((a, b) => b[1] - a[1]).slice(0, 10),
                historicoDeBatalhas: stats.historicoDeBatalhas.sort((a, b) => new Date(a.date) - new Date(b.date))
            };

            fs.writeFileSync(path.join(statsDir, `${username}.json`), JSON.stringify(perfilJogador, null, 2));
        }

        console.log(`✅ Sucesso! Perfis individuais salvos na pasta "${statsDir}".`);

    } catch (error) {
        console.error('❌ Erro ao gerar os perfis individuais:', error);
    }
}

processarTodosOsRankings();