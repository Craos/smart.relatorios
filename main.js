/**
 * Created by oberd on 21/07/2017.
 */


let webservice = new Webservice(), usuariocorrente;
dhtmlxEvent(window, 'load', function () {

    console.info('versão 1.1');

    // noinspection JSUnresolvedFunction
    Login({
        Caption: 'Smart Relatórios',
        System: 'smartrelatorios',
        WebService: webservice
    }, function (user) {
        usuariocorrente = user;
        new Main();
    });

});

function Main() {

    let layout = new dhtmlXLayoutObject({
        parent: document.body,
        pattern: '3T',
        offsets: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        },
        cells: [
            {
                id: 'a',
                collapse: false,
                height: 40,
                header: false,
                fix_size: [true, true]
            },
            {
                id: 'b',
                collapse: false,
                width: 280,
                header: false
            },
            {
                id: 'c',
                collapse: false,
                header: false
            }
        ]
    });

    layout.cells('a').attachURL('top.html');

    let treeview = layout.cells('b').attachTreeView({
        items: [
            {
                id: 'sistemas', text: "Sistemas", open: 1, items: [
                    {
                        id: 'cadastro', text: "Cadastros", open: 1, items: [
                            {
                                id: 'moradores', text: "Moradores", open: 0, items: [
                                    {id: 'cadastro_moradores', text: "Situação do cadastro"},
                                    {id: 'cadastro_moradores_complementos', text: "Informações complementares"},
                                    {id: 'cadastro_moradores_sem_autenticacao', text: "Cadastros sem autenticação"}
                                ]
                            },
                            {
                                id: 'veiculos', text: "Veículos", open: 0, items: [
                                    {id: 'cadastro_veiculos', text: "Situação do cadastro"},
                                    {id: 'cadastro_veiculos_unidade', text: "Situação do cadastro por unidade"},
                                    {id: 'cadastro_veiculos_sem_autenticacao', text: "Veículos sem autenticação"},
                                    {id: 'cadastro_veiculos_erros', text: "Erros de cadastro"}
                                ]
                            },
                            {
                                id: 'hospedes', text: "Hóspedes", open: 0, items: [
                                    {id: 'cadastro_hospedes', text: "Cadastro de hóspedes"}
                                ]
                            }
                        ]
                    },
                    {id: 'ctrlacesso', text: "Controle de acesso", open: 1, items: [
                            {id: 'triagem', text: "Triagem", items: [
                                    {id: 'triagem_pasagem', text: "Autorização de acesso"}
                                ]},
                            {id: 'ctrlmoradores', text: "Acesso de moradores", items: [
                                    {id: 'ctrlaccesspessoas', text: "Acesso pessoal"},
                                    {id: 'ctrlaccessveiculos', text: "Acesso veicular"}
                                ]},
                            {id: 'ctrlprestadores', text: "Acesso visitante / Prestadores", items: [
                                    {id: 'ctrlaccessprestadores', text: "Registro de acesso"}
                                ]}
                        ]}
                ]
            }
        ]
    });


    treeview.attachEvent("onDblClick", function (id) {

        let itemselecionado = relatorios.filter(function (item) {
            return item.id === id;
        });

        new relatorio({
            cell: layout.cells('c'),
            params: itemselecionado[0]
        });
        return true;

    });


}

let relatorios = [
    {id: 'cadastro_moradores',
        tipos: [
            {id: "relatorio.cadastro_moradores", type: "obj", text: "Analítico", img: "analitico.png", descricao: 'apresenta a lista de todos os moradores cadastrados no condomínio', campos: [{bloco: 'Bloco'}, {unidade: 'Unidade'}, {autenticacao: 'Autenticação'}, {nome: 'Nome'}, {genero: 'Gênero'}, {parentesco: 'Parentesco'}, {cpf: 'CPF'}, {rg: 'RG'}, {nascimento: 'Nascimento'}, {telefone: 'Telefone'}]},
            {id: "relatorio.cadastro_moradores_sintetico", type: "obj", text: "Sintético", img: "sintetico.png", descricao: 'apresenta o número de moradores cadastrados atualmente separados pelas torres', campos: [{bloco: 'Bloco'}, {moradores: 'Moradores'}]}
        ]
    },
    {id: 'cadastro_moradores_complementos',
        tipos: [
            {id: "relatorio.cadastro_moradores_complementos", type: "obj", text: "Analítico", img: "analitico.png", descricao: 'mostra as informações de auxilio para atendimento da pessoa em caso de emergência', campos: [{bloco: 'Bloco'}, {unidade: 'Unidade'}, {nome: 'Nome'}, {emg_plano_saude: 'Plano de saúde'}, {emg_alergia_medicamentos: 'Alergico a medicamentos'}, {emg_necessidade_especial: 'Necessidades especiais'}, {gruposanguineo: 'Grupo sanquíneo'}, {emg_remedio: 'Remédio periódico'}, {emg_parente: 'Emergência contactar'}, {emg_parente_telefone: 'Telefone'}]}
        ]
    },
    {id: 'cadastro_moradores_sem_autenticacao',
        tipos: [
            {id: "relatorio.cadastro_moradores_sem_autenticacao_analitico", type: "obj", text: "Analítico", img: "analitico.png", descricao: "utilizado para identificar pessoas cadastradas porém sem completar o registro de autorização automática", campos: [{datacadastro: 'Data de cadastro'}, {bloco: 'Bloco'}, {unidade: 'Unidade'}, {nome: 'Nome'}]},
            {id: "relatorio.cadastro_moradores_sem_autenticacao_consolidado", type: "obj", text: "Sintético", img: "sintetico.png", descricao: 'apresenta o número de pessoas que faltam para completar o cadastro com foto e autorização de acesso', campos: [{bloco: 'Bloco'}, {registros: 'Registros'}]}
        ]
    },
    {id: 'cadastro_veiculos',
        tipos: [
            {id: "relatorio.cadastro_veiculos_analitico", type: "obj", text: "Analítico", img: "analitico.png", descricao: 'apresenta a lista de todos os veículos cadastrados no condomínio', campos: [{filedate: 'Data'}, {timerg: 'Horário'}, {bloco: 'Bloco'}, {unidade: 'Unidade'}, {autenticacao: 'Autenticação'}, {marca: 'Marca'}, {modelo: 'Modelo'}, {cor: 'Cor'}, {placa: 'Placa'}, {tipoveiculo: 'Tipo de veículo'}, {proprietario: 'Proprietário'}]},
            {id: "relatorio.cadastro_veiculos_sintetico", type: "obj", text: "Sintético", img: "sintetico.png", descricao: 'apresenta a quantidade de veículos pelo tipo distribuídos pelas torres', campos: [{bloco: 'Bloco'}, {carros: 'Carros'}, {motos: 'Motos'}, {bicicleta: 'Bicicletas'}, {veiculos: 'Veículos'}]}
        ]
    },
    {id: 'cadastro_veiculos_unidade',
        tipos: [
            {id: "relatorio.cadastro_veiculos_por_unidade_sintetico", type: "obj", text: "Sintético", img: "analitico.png", descricao: 'Mostra o total de veículos na unidade descriminado pelo tipo do veículo', campos: [{bloco: 'Bloco'}, {unidade: 'Unidade'}, {carros: 'Carros'}, {motos: 'Motos'}, {bicicleta: 'Bicicletas'}, {veiculos: 'Total de veículos'}]}
        ]
    },
    {id: 'cadastro_veiculos_sem_autenticacao',
        tipos: [
            {id: "relatorio.cadastro_veiculos_sem_autenticacao_analitico", type: "obj", text: "Analítico", img: "analitico.png", descricao: 'lista os condomínios que ainda não completaram a autorização de acesso', campos: [{filedate: 'Data'}, {timerg: 'Horário'}, {bloco: 'Bloco'}, {unidade: 'Unidade'}, {marca: 'Marca'}, {modelo: 'Modelo'}, {cor: 'Cor'}, {placa: 'Placa'}, {tipoveiculo: 'Tipo de veículo'}]},
            {id: "relatorio.cadastro_veiculos_sem_autenticacao_consolidado", type: "obj", text: "Sintético", img: "sintetico.png", descricao: 'apresenta o número de veículos que faltam para completar o cadastro de autorização do veículo', campos: [{bloco: 'Bloco'}, {registros: 'Registros'}]}
        ]
    },
    {id: 'cadastro_veiculos_erros',
        tipos: [
            {id: "relatorio.cadastro_veiculos_erros_cadastro", type: "obj", text: "Analítico", img: "analitico.png", descricao: 'lista possíveis falhas no cadastro de veículos, exemplo: número de caracteres da placa inválido', campos: [{filedate: 'Data'}, {timerg: 'Horário'}, {bloco: 'Bloco'}, {unidade: 'Unidade'}, {autenticacao: 'Autenticação'}, {marca: 'Marca'}, {modelo: 'Modelo'}, {cor: 'Cor'}, {placa: 'Placa'}, {tipoveiculo: 'Tipo de veículo'}, {proprietario: 'Proprietário'}]}
        ]
    },
    {id: 'cadastro_hospedes',
        tipos: [
            {id: "relatorio.cadastro_hospedes", type: "obj", text: "Analítico", img: "analitico.png", descricao: 'apresenta a lista de todos os hóspedes cadastrados no condomínio', campos: [{data_registro: 'Data de registro'},{horario_registro: 'Horário'},{bloco: 'Bloco'},{unidade: 'Unidade'},{autenticacao: 'Autenticação'},{nome: 'Nome'},{genero: 'Gênero'},{rg: 'RG'},{nascimento: 'Data de nascimento'},{parentesco: 'Parentesco'},{telefone: 'Telefone'},{data_entrada: 'Data de entrada'}]}
        ]
    },
    {id: 'triagem_pasagem',
        tipos: [
            {id: "relatorio.triagem_passagem", type: "obj", text: "Analítico", img: "analitico.png", descricao: 'lista de todas as autorizações de acesso registradas pelo processo de triagem de veículos dos visitantes', campos: [{filedate: 'Data'}, {timerg: 'Horário'}, {num: 'Registro'}, {placa: 'Placa'}, {bloco: 'Torre'}, {unidade: 'unidade'},{autenticacao: 'Autenticação'}, {estacionamento: 'Estacionamento'}, {vaga: 'Vaga'}, {nome: 'Nome'}, {entrada: 'Entrada'}, {saida: 'Última saída'}, {tipo_acesso: 'Tipo de acesso'}]},
            {id: "relatorio.triagem_passagem_diario", type: "obj", text: "Sintético", img: "sintetico.png", descricao: 'apresenta a frequência dos motivos de visita sintetizados pelo dia do registro de acesso', campos: [{data: 'Data'}, {tipoacesso: 'Tipo de acesso'}, {registro: 'Registros'}]},
            {id: "relatorio.gera_triagem_passagem_anual()", type: "obj", text: "Consolidado", img: "consolidado.png", descricao: 'Resume os principais motivos para registro de visita de acordo com a série histórica dos anos'}
        ]
    },
    {id: 'ctrlaccesspessoas',
        tipos: [
            {id: "relatorio.ctrlacesso_pedestre_analitico", type: "obj", text: "Analítico", img: "analitico.png", descricao: 'Registro da passagem de pedestres nos acessos do condomínio',
                campos: [{filedate: 'Data de registro'},{timerg: 'Horário'},{num: 'Acesso'},{bloco: 'Torre'},{unidade: 'Unidade'},{autenticacao: 'Autenticação'},{bloqueio: 'Bloqueio'},{localizacao_equipamento: "Localização"},{localizacao_leitor: "Leitor"},{dsc_situacao: "Situação"},{sentido: "Sentido"},{nome: "Nome"},{tipo_de_cadastro: "Tipo de cadastro"}]}
        ]
    },
    {id: 'ctrlaccessveiculos',
        tipos: [
            {id: "relatorio.ctrlacesso_veiculos_analitico", type: "obj", text: "Analítico", img: "analitico.png", descricao: 'Registro da passagem de veículos nos acessos do condomínio',
                campos: [{filedate: 'Data de registro'},{timerg: 'Horário'},{num: 'Acesso'},{bloco: 'Torre'},{unidade: 'Unidade'},{autenticacao: 'Autenticação'},{bloqueio: 'Bloqueio'},{localizacao_equipamento: "Localização"},{localizacao_leitor: "Leitor"},{dsc_situacao: "Situação"},{sentido: "Sentido"},{modelo: "Modelo"},{placa: "Placa"},{cor: "Cor"}]}
        ]
    },
    {id: 'ctrlaccessprestadores',
        tipos: [
            {id: "relatorio.ctrlacesso_prestadores_analitico", type: "obj", text: "Analítico", img: "analitico.png", descricao: 'Registro da passagem de prestadores de serviço',
                campos: [{filedate: 'Data de registro'},{timerg: 'Horário'},{num: 'Acesso'},{bloco: 'Torre'},{unidade: 'Unidade'},{autenticacao: 'Autenticação'},{bloqueio: 'Bloqueio'},{dsc_situacao: "Situação"},{sentido: "Sentido"},{placa: "Placa"},{nome: "Nome"}]}
        ]
    }

];