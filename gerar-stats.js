const fs = require('fs');
const path = require('path');

const diretorioAtual = __dirname;
const nomeArquivoSaida = 'hall_of_fame_stats.json';

async function gerarHallDaFama() {
    console.log('Iniciando a compilação das estatísticas de todos os tempos...');

    const statsGerais = {}; 

    try {
        const arquivos = fs.readdirSync(diretorioAtual);
        const arquivosDeRanking = arquivos.filter(file => file.startsWith('ranking_') && file.endsWith('.json'));

        if (arquivosDeRanking.length === 0) {
            console.log('Nenhum arquivo de ranking diário encontrado.');
            return;
        }

        console.log(`Encontrados ${arquivosDeRanking.length} arquivos de ranking para processar...`);

        for (const arquivo of arquivosDeRanking) {
            const conteudo = fs.readFileSync(path.join(diretorioAtual, arquivo), 'utf-8');
            const dadosDoDia = JSON.parse(conteudo);

            for (const jogador of dadosDoDia) {
                const username = jogador.username;
                
                // ### LINHA CORRIGIDA ### Usa o nome correto: "eliminatedCount"
                const eliminacoes = jogador.eliminatedCount || 0;

                if (statsGerais[username]) {
                    statsGerais[username].eliminacoes += eliminacoes;
                    // ### LINHA CORRIGIDA ### Usa o nome correto: "imageUrl"
                    statsGerais[username].imageUrl = jogador.imageUrl; 
                } else {
                    statsGerais[username] = {
                        username: username,
                        // ### LINHA CORRIGIDA ### Usa o nome correto: "imageUrl"
                        imageUrl: jogador.imageUrl,
                        eliminacoes: eliminacoes,
                    };
                }
            }
        }

        const rankingArray = Object.values(statsGerais);
        rankingArray.sort((a, b) => b.eliminacoes - a.eliminacoes);
        fs.writeFileSync(nomeArquivoSaida, JSON.stringify(rankingArray, null, 2));

        console.log(`✅ Sucesso! Hall da Fama atualizado e salvo em "${nomeArquivoSaida}".`);
        if (rankingArray.length > 0) {
            console.log(`🏆 O maior carrasco de todos os tempos é @${rankingArray[0].username} com ${rankingArray[0].eliminacoes} eliminações.`);
        }

    } catch (error) {
        console.error('❌ Erro ao gerar as estatísticas do Hall da Fama:', error);
    }
}

gerarHallDaFama();