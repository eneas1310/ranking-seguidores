const fs = require('fs');
const path = require('path');

const diretorioAtual = __dirname;
const statsDir = path.join(diretorioAtual, 'stats');

// Cria a pasta /stats/ se ela não existir
if (!fs.existsSync(statsDir)) {
    fs.mkdirSync(statsDir);
}

// Função para calcular pontos com base no rank
function calcularPontos(rank) {
    if (rank === 1) return 100;
    if (rank === 2) return 90;
    if (rank === 3) return 80;
    if (rank >= 4 && rank <= 10) return 60;
    if (rank >= 11 && rank <= 50) return 40;
    if (rank >= 51 && rank <= 100) return 30;
    if (rank >= 101 && rank <= 250) return 20;
    if (rank >= 251 && rank <= 500) return 15;
    if (rank >= 501 && rank <= 1000) return 10;
    if (rank >= 1001 && rank <= 2000) return 5;
    if (rank >= 2001 && rank <= 3000) return 3;
    if (rank >= 3001 && rank <= 4000) return 1;
    return 0;
}


// --- Lógica Principal ---
async function processarTodosOsRankings() {
    console.log('Iniciando processamento de todos os dados...');
    try {
        // --- 1. LER DADOS ANTIGOS PARA COMPARAR RANK ---
        const hallOfFamePath = path.join(diretorioAtual, 'hall_of_fame_stats.json');
        const previousRanksMap = new Map();
        let oldData = [];

        if (fs.existsSync(hallOfFamePath)) {
            try {
                const oldContent = fs.readFileSync(hallOfFamePath, 'utf-8');
                oldData = JSON.parse(oldContent);
                
                // Ordena os dados antigos pelos pontos para saber o rank anterior
                oldData.sort((a, b) => b.pontosAcumulados - a.pontosAcumulados);
                
                oldData.forEach((player, index) => {
                    previousRanksMap.set(player.username, index + 1); // Salva o rank anterior (ex: 1º, 2º)
                });
                console.log('Dados de rank anterior carregados.');
            } catch (e) {
                console.warn('Arquivo hall_of_fame_stats.json antigo corrompido. Ignorando...');
                previousRanksMap.clear();
            }
        }

        // --- FILTRO DE MÊS ATUAL ---
        const mesAtual = new Date().toISOString().slice(0, 7); // ex: '2025-10'
        console.log(`Filtrando arquivos de ranking para o mês: ${mesAtual}`);

        const arquivos = fs.readdirSync(diretorioAtual);
        const arquivosDeRanking = arquivos
            .filter(file => file.startsWith('ranking_') && file.endsWith('.json') && file.includes(mesAtual))
            .sort();

        if (arquivosDeRanking.length === 0) {
            throw new Error(`Nenhum arquivo de ranking encontrado para o mês ${mesAtual}.`);
        }

        console.log(`Arquivos encontrados: ${arquivosDeRanking.join(', ')}`);

        const masterStats = {};

        // 2. Agrega todos os dados de todas as rodadas
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
                        pontosAcumulados: 0,
                        historicoDeBatalhas: [],
                        // maioresVitimas: {},   // <-- REMOVIDO
                        // maioresCarrascos: {}  // <-- REMOVIDO
                    };
                }

                // Atualiza a URL da imagem se for mais recente (evita imagem quebrada)
                if (jogador.imageUrl) {
                    masterStats[username].imageUrl = jogador.imageUrl;
                }

                const pontosDoDia = calcularPontos(jogador.rank);
                masterStats[username].pontosAcumulados += pontosDoDia;

                masterStats[username].historicoDeBatalhas.push({
                    date: dataDaRodada,
                    rank: jogador.rank,
                    pontos: pontosDoDia, 
                    eliminatedCount: jogador.eliminatedCount || 0, // Garante que é um número
                    eliminatedBy: jogador.eliminatedBy
                });

                // --- BLOCOS REMOVIDOS ---
                // if (jogador.eliminatedList && Array.isArray(jogador.eliminatedList)) {
                //     jogador.eliminatedList.forEach(vitima => {
                //         masterStats[username].maioresVitimas[vitima] = (masterStats[username].maioresVitimas[vitima] || 0) + 1;
                //     });
                // }

                // if (jogador.eliminatedBy && jogador.eliminatedBy !== 'Sobrevivente') {
                //     const carrasco = jogador.eliminatedBy;
                //     masterStats[username].maioresCarrascos[carrasco] = (masterStats[username].maioresCarrascos[carrasco] || 0) + 1;
                // }
            }
        }

        // 3. Gera e salva os perfis individuais
        for (const username in masterStats) {
            const stats = masterStats[username];
            
            const totalEliminacoes = stats.historicoDeBatalhas.reduce((sum, b) => sum + (b.eliminatedCount || 0), 0);
            const totalParticipacoes = stats.historicoDeBatalhas.length;
            const somaDosRanks = stats.historicoDeBatalhas.reduce((sum, b) => sum + b.rank, 0);
            
            let melhorBatalha = { rank: Infinity, date: '' };
            if (stats.historicoDeBatalhas.length > 0) {
                 melhorBatalha = stats.historicoDeBatalhas.reduce((best, current) => current.rank < best.rank ? current : best);
            }
            
            let piorBatalha = { rank: -Infinity, date: '' };
             if (stats.historicoDeBatalhas.length > 0) {
                piorBatalha = stats.historicoDeBatalhas.reduce((worst, current) => current.rank > worst.rank ? current : worst);
            }

            const perfilJogador = {
                username: stats.username,
                imageUrl: stats.imageUrl,
                totalParticipacoes: totalParticipacoes,
                totalEliminacoes: totalEliminacoes,
                pontosAcumulados: stats.pontosAcumulados, // Adiciona pontos ao perfil
                mediaRank: (somaDosRanks / totalParticipacoes).toFixed(2),
                mediaEliminacoes: (totalEliminacoes / totalParticipacoes).toFixed(2),
                melhorRank: { rank: melhorBatalha.rank === Infinity ? null : melhorBatalha.rank, date: melhorBatalha.rank === Infinity ? null : melhorBatalha.date },
                piorRank: { rank: piorBatalha.rank === -Infinity ? null : piorBatalha.rank, date: piorBatalha.rank === -Infinity ? null : piorBatalha.date },
                // maioresVitimas: Object.entries(stats.maioresVitimas).sort((a, b) => b[1] - a[1]).slice(0, 10),    // <-- REMOVIDO
                // maioresCarrascos: Object.entries(stats.maioresCarrascos).sort((a, b) => b[1] - a[1]).slice(0, 10), // <-- REMOVIDO
                historicoDeBatalhas: stats.historicoDeBatalhas.sort((a, b) => new Date(a.date) - new Date(b.date))
            };

            fs.writeFileSync(path.join(statsDir, `${username}.json`), JSON.stringify(perfilJogador, null, 2));
        }
        console.log(`Perfis individuais da pasta /stats/ atualizados.`);

        // 4. Gera o hall_of_fame_stats.json com resumo geral
        const hallOfFameArray = Object.values(masterStats).map(stats => {
            const totalEliminacoes = stats.historicoDeBatalhas.reduce((sum, b) => sum + (b.eliminatedCount || 0), 0);
            const totalParticipacoes = stats.historicoDeBatalhas.length;
            const somaDosRanks = stats.historicoDeBatalhas.reduce((sum, b) => sum + b.rank, 0);

            let melhorBatalha = { rank: Infinity, date: '' };
            if (stats.historicoDeBatalhas.length > 0) {
                 melhorBatalha = stats.historicoDeBatalhas.reduce((best, current) => current.rank < best.rank ? current : best);
            }

            return {
                username: stats.username,
                imageUrl: stats.imageUrl,
                pontosAcumulados: stats.pontosAcumulados,
                totalParticipacoes: totalParticipacoes,
                totalEliminacoes: totalEliminacoes,
                mediaRank: (somaDosRanks / totalParticipacoes).toFixed(2),
                mediaEliminacoes: (totalEliminacoes / totalParticipacoes).toFixed(2),
                bestRank: melhorBatalha.rank === Infinity ? null : melhorBatalha.rank,
                bestRankDate: melhorBatalha.rank === Infinity ? null : melhorBatalha.date,
                previousRank: previousRanksMap.get(stats.username) || null
            };
        });

        // 5. CALCULAR MUDANÇA DE RANK
        hallOfFameArray.sort((a, b) => b.pontosAcumulados - a.pontosAcumulados);

        hallOfFameArray.forEach((player, index) => {
            const currentRank = index + 1;
            const previousRank = player.previousRank;
            
            if (previousRank) {
                player.rankChange = previousRank - currentRank;
            } else {
                player.rankChange = 'new';
            }
            
            delete player.previousRank;
        });


        fs.writeFileSync(
            hallOfFamePath,
            JSON.stringify(hallOfFameArray, null, 2)
        );

        console.log(`🏆 Arquivo "hall_of_fame_stats.json" atualizado com sucesso!`);

    } catch (error) {
        console.error('❌ Erro ao gerar os perfis e o hall da fama:', error);
    }
}

processarTodosOsRankings();