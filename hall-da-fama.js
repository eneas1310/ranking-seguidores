document.addEventListener('DOMContentLoaded', () => {
    // Pega o container onde as informações serão exibidas
    const container = document.getElementById('carrasco-do-dia-container');

    // 1. GERA O NOME DO ARQUIVO DE RANKING DO DIA ATUAL
    const hoje = new Date();
    const ano = hoje.getFullYear();
    // getMonth() retorna 0-11, então somamos 1. Adicionamos '0' se for menor que 10.
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); 
    const dia = String(hoje.getDate()).padStart(2, '0');
    
    const nomeArquivo = `ranking_${ano}-${mes}-${dia}.json`; // Ex: "ranking_2025-10-15.json"

    // 2. BUSCA E PROCESSA O ARQUIVO JSON
    fetch(nomeArquivo)
        .then(response => {
            if (!response.ok) {
                // Lança um erro se o arquivo não for encontrado (ex: ranking não gerado)
                throw new Error('Arquivo de ranking para o dia de hoje não encontrado.');
            }
            return response.json();
        })
        .then(dadosRanking => {
            // Verifica se há dados no arquivo
            if (!dadosRanking || dadosRanking.length === 0) {
                container.innerHTML = '<p>Não há participantes no ranking de hoje.</p>';
                return;
            }

            // 3. ENCONTRA O "MAIS CARRASCO" (QUEM TEM MAIS ELIMINAÇÕES)
            const maisCarrasco = dadosRanking.reduce((maior, atual) => {
                // Compara as eliminações do 'maior' encontrado até agora com o 'atual'
                return (atual.eliminacoes > maior.eliminacoes) ? atual : maior;
            }, dadosRanking[0]); // Começa a comparação com o primeiro participante

            // 4. EXIBE O RESULTADO NA TELA
            exibirCarrasco(maisCarrasco);
        })
        .catch(error => {
            // Exibe uma mensagem de erro amigável na página
            console.error('Erro:', error);
            container.innerHTML = `<p>Ainda não há ranking para o dia ${dia}/${mes}/${ano}.</p>`;
        });

    // Função para criar o HTML e exibir o carrasco na página
    function exibirCarrasco(carrasco) {
        // Limpa a mensagem de "carregando"
        container.innerHTML = ''; 

        const htmlCarrasco = `
            <div class="carrasco-card">
                <h3>MAIOR CARRASCO DE HOJE</h3>
                <img src="${carrasco.profile_pic_url}" alt="Foto de ${carrasco.username}" class="profile-pic">
                <h2>@${carrasco.username}</h2>
                <div class="stats">
                    <span class="eliminacoes-count">💀 ${carrasco.eliminacoes} ELIMINAÇÕES 💀</span>
                </div>
            </div>
        `;
        
        container.innerHTML = htmlCarrasco;
    }
});