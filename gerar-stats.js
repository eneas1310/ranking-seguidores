const fs = require('fs');
const path = require('path');

const diretorioAtual = __dirname;
const nomeArquivoSaida = 'hall_of_fame_stats.json';

// Função principal para gerar as estatísticas
async function gerarHallDaFama() {
    console.log('Iniciando a compilação das estatísticas de todos os tempos...');

    const statsGerais = {}; // Objeto para guardar os dados acumulados

    try {
        // Lê todos os arquivos no diretório
        const arquivos = fs.readdirSync(diretorioAtual);

        // Filtra para pegar apenas os arquivos de ranking diário
        const arquivosDeRanking = arquivos.filter(file => file.startsWith('ranking_') && file.endsWith('.json'));

        if (arquivosDeRanking.length === 0) {
            console.log('Nenhum arquivo de ranking diário encontrado.');
            return;
        }

        console.log(`Encontrados ${arquivosDeRanking.length} arquivos de ranking para processar...`);

        // Processa cada arquivo de ranking
        for (const arquivo of arquivosDeRanking) {
            const conteudo = fs.readFileSync(path.join(diretorioAtual, arquivo), 'utf-8');
            const dadosDoDia = JSON.parse(conteudo);

            for (const jogador of dadosDoDia) {
                const username = jogador.username;
                const eliminacoes = jogador.eliminacoes || 0;

                // Se o jogador já existe nas estatísticas, soma as eliminações
                if (statsGerais[username]) {
                    statsGerais[username].eliminacoes += eliminacoes;
                    // Atualiza a foto para a mais recente
                    statsGerais[username].profile_pic_url = jogador.profile_pic_url;
                } else {
                    // Se não existe, adiciona o jogador
                    statsGerais[username] = {
                        username: username,
                        profile_pic_url: jogador.profile_pic_url,
                        eliminacoes: eliminacoes,
                    };
                }
            }
        }

        // Converte o objeto de estatísticas em um array
        const rankingArray = Object.values(statsGerais);

        // Ordena o array por número de eliminações (do maior para o menor)
        rankingArray.sort((a, b) => b.eliminacoes - a.eliminacoes);

        // Salva o resultado no arquivo final
        fs.writeFileSync(nomeArquivoSaida, JSON.stringify(rankingArray, null, 2));

        console.log(`✅ Sucesso! Hall da Fama atualizado e salvo em "${nomeArquivoSaida}".`);
        console.log(`🏆 O maior carrasco de todos os tempos é @${rankingArray[0].username} com ${rankingArray[0].eliminacoes} eliminações.`);

    } catch (error) {
        console.error('❌ Erro ao gerar as estatísticas do Hall da Fama:', error);
    }
}

// Executa a função
gerarHallDaFama();