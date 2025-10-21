const fs = require('fs');
const path = require('path');

const diretorioAtual = __dirname;
const statsDir = path.join(diretorioAtual, 'stats');

// Cria a pasta /stats/ se ela não existir
if (!fs.existsSync(statsDir)) {
    fs.mkdirSync(statsDir);
}

// --- NOVA FUNÇÃO ---
// Adicionada função para calcular pontos com base no rank
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
    return 0; // Se o rank for maior que 4000, não ganha pontos
}


// --- Lógica Principal ---
async function processarTodosOsRankings() {
    console.log('Iniciando processamento de todos os dados...');
    try {
        // --- FILTRO DE MÊS ATUAL ADICIONADO ---
        // Pega o mês atual no formato 'YYYY-MM' (ex: '2025-10')
        // Isso faz com que o ranking seja "do Mês" como diz seu título
        const mesAtual = new Date().toISOString().slice(0, 7);
        console.log(`Filtrando arquivos de ranking para o mês: ${mesAtual}`);

        const arquivos = fs.readdirSync(diretorioAtual);
        
        // Modificado para filtrar arquivos apenas do mês atual
        const arquivosDeRanking = arquivos
            .filter(file => file.startsWith('ranking_') && file.endsWith('.json') && file.includes(mesAtual))
            .sort();

        if (arquivosDeRanking.length === 0) {
            throw new Error(`Nenhum arquivo de ranking encontrado para o mês ${mesAtual}.`);
        }

        console.log(`Arquivos encontrados: ${arquivosDeRanking.join(', ')}`);

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
                        pontosAcumulados: 0, // <-- PROPRIEDADE DE PONTOS ADICIONADA
                        historicoDeBatalhas: [],
                        maioresVitimas: {},
                        maioresCarrascos: {}
                    };
                }

                masterStats[username].imageUrl = jogador.imageUrl;

                // --- CÁLCULO DE PONTOS ADICIONADO ---
                const pontosDoDia = calcularPontos(jogador.rank);
                masterStats[username].pontosAcumulados += pontosDoDia;

                masterStats[username].historicoDeBatalhas.push({
                    date: dataDaRodada,
                    rank: jogador.rank,
                    pontos: pontosDoDia, // <-- Salva os pontos do dia no histórico
                    eliminatedCount: jogador.eliminatedCount,
                    eliminatedBy: jogador.eliminatedBy
                });

                // Garantir que eliminatedList existe antes de usar
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

        // 2. Gera e salva os perfis individuais
        for (const username in masterStats) {
            const stats = masterStats[username];
            
            // ... (cálculos de perfil)
            // (O resto desta seção de "perfis individuais" pode continuar a mesma)
            // ...
        }

        // 3. Gera o hall_of_fame_stats.json com resumo geral
        const hallOfFameArray = Object.values(masterStats).map(stats => {
            const totalEliminacoes = stats.historicoDeBatalhas.reduce((sum, b) => sum + b.eliminatedCount, 0);
            const totalParticipacoes = stats.historicoDeBatalhas.length;
            const somaDosRanks = stats.historicoDeBatalhas.reduce((sum, b) => sum + b.rank, 0);

            return {
                username: stats.username,
                imageUrl: stats.imageUrl,
                pontosAcumulados: stats.pontosAcumulados, // <-- PROPRIEDADE DE PONTOS ADICIONADA
                totalParticipacoes: totalParticipacoes,
                totalEliminacoes: totalEliminacoes,
                mediaRank: (somaDosRanks / totalParticipacoes).toFixed(2),
                mediaEliminacoes: (totalEliminacoes / totalParticipacoes).toFixed(2)
            };
        });

        fs.writeFileSync(
            path.join(diretorioAtual, 'hall_of_fame_stats.json'),
            JSON.stringify(hallOfFameArray, null, 2)
        );

        console.log(`🏆 Arquivo "hall_of_fame_stats.json" atualizado com sucesso!`);

    } catch (error) {
        console.error('❌ Erro ao gerar os perfis e o hall da fama:', error);
    }
}

processarTodosOsRankings();
