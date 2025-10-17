const fs = require('fs');
const path = require('path');

const diretorioAtual = __dirname;
const nomeArquivoSaida = 'hall_of_fame_stats.json';

// Função para calcular os pontos baseados na posição
function getPontosPorPosicao(rank) {
    if (rank === 1) return 500;
    if (rank === 2) return 400;
    if (rank === 3) return 350;
    if (rank >= 4 && rank <= 10) return 250;
    if (rank >= 11 && rank <= 50) return 150;
    if (rank >= 51 && rank <= 100) return 100;
    if (rank >= 101 && rank <= 250) return 75;
    if (rank >= 251 && rank <= 500) return 50;
    if (rank >= 501 && rank <= 1000) return 25;
    if (rank >= 1001 && rank <= 2000) return 10;
    return 0;
}

async function gerarRankingDePontos() {
    console.log('Iniciando a compilação do ranking de pontos...');
    const statsTemporada = {};

    try {
        const arquivos = fs.readdirSync(diretorioAtual);
        const arquivosDeRanking = arquivos.filter(file => file.startsWith('ranking_') && file.endsWith('.json'));

        if (arquivosDeRanking.length === 0) {
            throw new Error("Nenhum arquivo de ranking (ranking_*.json) foi encontrado.");
        }
        console.log(`Encontrados ${arquivosDeRanking.length} arquivos de ranking...`);

        for (const arquivo of arquivosDeRanking) {
            const conteudo = fs.readFileSync(path.join(diretorioAtual, arquivo), 'utf-8');
            const dadosDoDia = JSON.parse(conteudo);

            for (const jogador of dadosDoDia) {
                const username = jogador.username;
                if (!statsTemporada[username]) {
                    statsTemporada[username] = {
                        username: username,
                        imageUrl: jogador.imageUrl,
                        pontos: 0
                    };
                }
                
                statsTemporada[username].imageUrl = jogador.imageUrl;
                statsTemporada[username].pontos += getPontosPorPosicao(jogador.rank);
            }
        }

        const rankingArray = Object.values(statsTemporada)
            .filter(p => p.pontos > 0) // Inclui apenas jogadores que pontuaram
            .sort((a, b) => b.pontos - a.pontos);

        // O arquivo final agora terá apenas a lista de pontuação
        fs.writeFileSync(nomeArquivoSaida, JSON.stringify(rankingArray, null, 2));
        console.log(`✅ Sucesso! Ranking de pontos salvo em "${nomeArquivoSaida}".`);

    } catch (error) {
        console.error('❌ Erro ao gerar as estatísticas:', error);
    }
}

gerarRankingDePontos();