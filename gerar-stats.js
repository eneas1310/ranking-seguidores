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
    return 0; // Se não estiver no top 2000, não ganha pontos de posição
}

async function gerarHallDaFama() {
    console.log('Iniciando a compilação das estatísticas...');

    const statsGerais = {};

    try {
        const arquivos = fs.readdirSync(diretorioAtual);
        const arquivosDeRanking = arquivos.filter(file => file.startsWith('ranking_') && file.endsWith('.json'));

        console.log(`Encontrados ${arquivosDeRanking.length} arquivos de ranking...`);

        for (const arquivo of arquivosDeRanking) {
            const conteudo = fs.readFileSync(path.join(diretorioAtual, arquivo), 'utf-8');
            const dadosDoDia = JSON.parse(conteudo);
            
            // Extrai a data do nome do arquivo para determinar a temporada
            const nomeSemExtensao = path.parse(arquivo).name;
            const [, ano, mes] = nomeSemExtensao.split('_');
            const temporada = `${ano}-${mes}`; // Ex: "2025-10"

            for (const jogador of dadosDoDia) {
                const username = jogador.username;

                // Inicializa o jogador se for a primeira vez que aparece
                if (!statsGerais[username]) {
                    statsGerais[username] = {
                        username: username,
                        imageUrl: jogador.imageUrl,
                        eliminacoes: 0,
                        pontosPorTemporada: {}
                    };
                }
                
                // Atualiza a imagem para a mais recente
                statsGerais[username].imageUrl = jogador.imageUrl;

                // Soma as eliminações para o ranking "Maiores Carrascos" (All-Time)
                statsGerais[username].eliminacoes += jogador.eliminatedCount || 0;

                // Calcula e soma os pontos para o ranking da temporada
                const pontosDoDia = getPontosPorPosicao(jogador.rank);
                
                if (!statsGerais[username].pontosPorTemporada[temporada]) {
                    statsGerais[username].pontosPorTemporada[temporada] = 0;
                }
                statsGerais[username].pontosPorTemporada[temporada] += pontosDoDia;
            }
        }

        // Prepara os dados para salvar no JSON final
        const todosOsJogadores = Object.values(statsGerais);

        const dadosFinais = {
            maioresCarrascos: todosOsJogadores.map(p => ({
                username: p.username,
                imageUrl: p.imageUrl,
                eliminacoes: p.eliminacoes
            })).sort((a, b) => b.eliminacoes - a.eliminacoes),

            pontuacaoTemporada: {
                "2025-10": todosOsJogadores.filter(p => p.pontosPorTemporada["2025-10"])
                    .map(p => ({
                        username: p.username,
                        imageUrl: p.imageUrl,
                        pontos: p.pontosPorTemporada["2025-10"]
                    })).sort((a, b) => b.pontos - a.pontos)
            }
        };

        fs.writeFileSync(nomeArquivoSaida, JSON.stringify(dadosFinais, null, 2));
        console.log(`✅ Sucesso! Estatísticas salvas em "${nomeArquivoSaida}".`);

    } catch (error) {
        console.error('❌ Erro ao gerar as estatísticas:', error);
    }
}

gerarHallDaFama();