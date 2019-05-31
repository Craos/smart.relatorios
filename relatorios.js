var relatorio = function (Info) {

    var origem;
    var filter = '';
    var titulos = '';
    var nomecampos = '';
    var exportcampos = [];
    var gridresultados;

    Info.cell.detachObject(true);
    var layoutreport = Info.cell.attachLayout({
        pattern: '2E',
        cells: [
            {
                id: 'a',
                collapse: false,
                header: false,
                height: 200
            },
            {
                id: 'b',
                collapse: false,
                header: false
            }
        ]
    });



    var statusbarDescricaoRelatorio = layoutreport.cells('a').attachStatusBar({
        text: '',
        height: 35
    });

    var statusbarResultados = layoutreport.cells('b').attachStatusBar({
        text: '',
        height: 35
    });

    var gridcriterios = layoutreport.cells('a').attachGrid();
    gridcriterios.setHeader('Critério,Campo,Operador,Valor');
    gridcriterios.setColTypes("co,co,co,ed");
    gridcriterios.setInitWidths("80,*,150,*");
    gridcriterios.init();

    var criterio = gridcriterios.getCombo(0);
    criterio.clear();
    criterio.put('', '');
    criterio.put(' and ', ' E ');
    criterio.put(' or ', ' Ou ');
    criterio.put(' between ', ' Entre ');

    var operador = gridcriterios.getCombo(2);
    operador.clear();
    operador.put('=', 'Igual a');
    operador.put("contem", 'Contém');
    operador.put("naocontem", 'Não Contém');
    operador.put("iniciar", 'Começa com');
    operador.put("finaliza", 'Termina com');
    operador.put("maiorque", 'Maior que');
    operador.put("menorque", 'Menor que');

    var AdicionarCriterio = function () {
        var newId = (new Date()).valueOf();
        gridcriterios.addRow(newId, "");
    };

    var RemoverCriterio = function () {
        gridcriterios.deleteSelectedRows();
    };

    var exportarCSV = function (filename, rows) {

        var processRow = function (row) {
            var finalVal = '';
            for (var j = 0; j < row.length; j++) {

                var innerValue = row[j] === null ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                }

                var result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0)
                    result = '"' + result + '"';
                if (j > 0)
                    finalVal += ',';
                finalVal += result;
            }
            return finalVal + '\n';
        };

        var csvFile = '';
        for (var i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        var blob = new Blob([csvFile], {type: 'text/csv;charset=utf-8;'});
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    };

    var recebeInformacoes = function () {

        layoutreport.cells('b').progressOn();
        var ec = new ws('as');
        ec.Request({
            c: 7,
            cn: 'as',
            process: 'query',
            params: JSON.stringify({
                command: 'select',
                fields: nomecampos,
                from: origem,
                where: obtemcriterios()
            })
        }, function (http) {

            // noinspection JSCheckFunctionSignatures
            var resultado = JSON.parse(http.response);

            if (!resultado) {
                layoutreport.cells('b').progressOff();
                return;
            }

            var dados = [];
            dados.push(exportcampos);

            resultado.filter(function (item) {
                // noinspection JSCheckFunctionSignatures
                var info = JSON.parse(item.query);

                dados.push(Object.keys(info).map(function (k) {
                    return info[k]
                }));
            });

            exportarCSV(Info.params.id + '.csv', dados);
            layoutreport.cells('b').progressOff();
        });
    };

    var obtemcriterios = function () {

        var stringcriterios = '';

        var entre = null;
        for (var i = 0; i < gridcriterios.getRowsNum(); i++) {

            if (i === entre)
                continue;

            var id = gridcriterios.getRowId(i);
            var expressao = '';
            var criterio = gridcriterios.cells(id, 0).getValue();
            var campo = gridcriterios.cells(id, 1).getValue();
            var operador = gridcriterios.cells(id, 2).getValue();
            var valor = gridcriterios.cells(id, 3).getValue();


            if (criterio === ' between ') {
                entre = i + 1;

                var proximalinha = gridcriterios.getRowId(i + 1);
                var proximovalor = gridcriterios.cells(proximalinha, 3).getValue();
                expressao = "(upper(trim(" + campo + ")) between upper(trim('" + valor.toUpperCase() + "')) and upper(trim('" + proximovalor.toUpperCase() + "'))) ";

            } else {

                if (operador === 'contem') {
                    expressao = criterio + "(upper(trim(" + campo + ")) like upper(trim('%" + valor.toUpperCase() + "%'))) ";

                } else if (operador === 'naocontem') {
                    expressao = criterio + "(upper(trim(" + campo + ")) not like upper(trim('%" + valor.toUpperCase() + "%'))) ";

                } else if (operador === 'iniciar') {
                    expressao = criterio + "(upper(trim(" + campo + ")) like upper(trim('" + valor.toUpperCase() + "%'))) ";

                } else if (operador === 'finaliza') {
                    expressao = criterio + "(upper(trim(" + campo + ")) like upper(trim('%" + valor.toUpperCase() + "'))) ";

                } else if (operador === 'maiorque') {
                    expressao = criterio + "(" + campo + " > " + valor + ") ";

                } else if (operador === 'menorque') {
                    expressao = criterio + "(" + campo + " < " + valor + ") ";

                } else {
                    expressao = criterio + "(upper(trim(" + campo + "::varchar)) = upper(trim('" + valor.toUpperCase() + "'))) ";
                }

            }

            stringcriterios += expressao;

        }

        return stringcriterios;

    };

    var preencheGrid = function (resultado) {

        if (nomecampos === '*') {
            nomecampos = '';
            Object.keys(JSON.parse(resultado[0].query)).map(function (k) {
                nomecampos += k + ',';
            });

            nomecampos = nomecampos.substring(0, nomecampos.length - 1);
            gridresultados.setHeader(nomecampos);
            gridresultados.setColumnIds(nomecampos);
        }

        gridresultados.init();
        gridresultados.clearAll();

        if (!resultado) {
            layoutreport.cells('b').progressOff();
            return;
        }

        var index = 0;
        resultado.filter(function (item) {
            // noinspection JSCheckFunctionSignatures
            var info = JSON.parse(item.query);


            gridresultados.addRow(index, Object.keys(info).map(function (k) {
                return info[k]
            }));
            index++;
        });

        layoutreport.cells('b').progressOff();

    };

    var VisualizarRelatorio = function () {

        layoutreport.cells('b').progressOn();
        layoutreport.cells('b').detachObject(true);

        gridresultados = layoutreport.cells('b').attachGrid();

        if (nomecampos !== '*') {
            gridresultados.setHeader(titulos);
            gridresultados.setColumnIds(nomecampos);
            gridresultados.attachHeader(filter);
        }

        gridresultados.enableSmartRendering(true);
        gridresultados.enableMultiselect(true);

        layoutreport.cells('b').attachToolbar({
            icon_path: "img/",
            items: [
                {id: "exportar_csv", type: "button", text: "Exportar para CSV", img: "exportar.png"}
            ],
            onClick: function (id) {

                switch (id) {
                    case 'exportar_csv':
                        recebeInformacoes('csv');
                        break;
                }

            }
        });

        let stringcriterios = obtemcriterios();

        webservice.Request({
            c: 7,
            cn: 'as',
            process: 'query',
            params: JSON.stringify({
                command: 'select',
                fields: nomecampos,
                from: origem,
                where: stringcriterios
            })
        }, function (http) {

            // noinspection JSCheckFunctionSignatures
            var resultado = JSON.parse(http.response);

            if (resultado === null)
            {
                layoutreport.cells('b').progressOff();
                return;
            }

            var linhasretornadas = resultado.length;
            statusbarResultados.setText(numberWithCommas(linhasretornadas) + ' linhas encontradas');

            if (linhasretornadas < 2000) {
                preencheGrid(resultado);

            } else {

                dhtmlx.confirm({
                    type:"confirm-warning",
                    title:"Resultado",
                    ok:"Sim", cancel:"Cancelar",
                    text:"Atenção o resultado é superior a 2000 \n considere novos critérios para exibição das informações \n linhas deseja continuar?",
                    callback:function(result) {
                        if (result === true) {
                            preencheGrid(resultado);
                        } else {
                            layoutreport.cells('b').progressOff();
                        }
                    }
                });
            }


        });
    };

    var atualizaCamposCriterios = function (listacampos) {

        gridcriterios.clearAll();
        var campos = gridcriterios.getCombo(1);
        campos.clear();

        titulos = '';
        nomecampos = '';
        filter = '';
        exportcampos = [];

        if (listacampos !== undefined) {
            listacampos.filter(function (item) {
                Object.keys(item).map(function (k) {
                    campos.put(k, item[k]);
                    titulos += item[k] + ',';
                    nomecampos += k + ',';
                    exportcampos.push(item[k]);
                });
                filter += '#text_filter,';

            });

            nomecampos = nomecampos.substring(0, nomecampos.length - 1);
        } else {
            nomecampos = '*';
        }

    };

    var toolbar = layoutreport.cells('a').attachToolbar({
        icon_path: "img/",
        items: [
            {id: "incluir", type: "button", img: "plus.png"},
            {id: "excluir", type: "button", img: "minus.png"},
            {type: "buttonSelect", id: "tipo", text: "Tipo", img: "visao.png", options: Info.params.tipos, disabled: true},
            {id: "tiposaida", type: "text", text: ""},
            {id: "sep1", type: "separator"},
            {id: "visualizar", type: "button", text: "Iniciar", img: "start.png"}
        ],
        onClick: function (id) {

            if (toolbar.getType(id) === 'buttonSelectButton') {
                toolbar.setItemText('tiposaida', toolbar.getListOptionText('tipo', id));
                origem = id;
                var item = Info.params.tipos.filter(function (t) {
                    return t.id === id
                });
                statusbarDescricaoRelatorio.setText('Descrição: ' + item[0].descricao);
                atualizaCamposCriterios(item[0].campos);
            }

            switch (id) {
                case 'incluir':
                    AdicionarCriterio();
                    break;
                case 'excluir':
                    RemoverCriterio();
                    break;
                case 'visualizar':
                    VisualizarRelatorio();
                    break;
            }

        }
    });

    if (Info.params.tipos.length === 1) {

        toolbar.setItemText('tiposaida', Info.params.tipos[0].text);
        origem = Info.params.tipos[0].id;

        statusbarDescricaoRelatorio.setText('Descrição: ' + Info.params.tipos[0].descricao);
        atualizaCamposCriterios(Info.params.tipos[0].campos);

    } else {
        toolbar.enableItem('tipo');
    }
    toolbar.addSpacer("sep1");

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
};