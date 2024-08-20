$(document).ready(function() {
    const settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/servidores/listar",
        "method": "GET",
        "headers": {
            "Authorization": "Basic YWRtaW46c2VuaGExMjM="  // Base64 de admin:senha123
        }
    };

    // Função para popular a tabela com os servidores
    function populateTable() {
        $.ajax(settings).done(function(response) {
            const servidoresTableBody = $('#servidoresTable tbody');
            servidoresTableBody.empty(); // Limpa o conteúdo da tabela antes de popular

            response.forEach(servidor => {
                const row = `<tr data-id="${servidor.id}">
                    <td>${servidor.id}</td>
                    <td>${servidor.nome}</td>
                    <td>${servidor.cargo}</td>
                    <td>${servidor.departamento}</td>
                    <td><button class="delete-btn">Excluir</button></td>
                    <td><button class="edit-btn">Editar</button></td>
                </tr>`;
                servidoresTableBody.append(row);
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log('Erro na requisição:', textStatus, errorThrown);
        });
    }

    // Popula a tabela quando a página é carregada
    populateTable();

    // Função para abrir o modal de edição
    $(document).on('click', '.edit-btn', function() {
        const row = $(this).closest('tr');
        const id = row.data('id');
        const nome = row.find('td:eq(1)').text();
        const cargo = row.find('td:eq(2)').text();
        const departamento = row.find('td:eq(3)').text();

        $('#edit-nome').val(nome);
        $('#edit-cargo').val(cargo);
        $('#edit-departamento').val(departamento);
        $('#edit-id').val(id);

        $('#modal').css('display', 'block');
    });

    // Função para fechar o modal de edição
    $('.close').click(function() {
        $('#modal').css('display', 'none');
    });

    // Função para enviar a requisição PUT e atualizar o servidor
    $('#editForm').submit(function(event) {
        event.preventDefault();

        const id = $('#edit-id').val();
        const servidor = {
            nome: $('#edit-nome').val(),
            cargo: $('#edit-cargo').val(),
            departamento: $('#edit-departamento').val()
        };

        const putSettings = {
            "async": true,
            "crossDomain": true,
            "url": `http://localhost:3000/servidores/atualizar/${id}`,
            "method": "PUT",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Basic YWRtaW46c2VuaGExMjM="  // Base64 de admin:senha123
            },
            "processData": false,
            "data": JSON.stringify(servidor)
        };

        $.ajax(putSettings).done(function() {
            populateTable(); // Atualiza a tabela após a edição
            $('#modal').css('display', 'none');
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log('Erro na requisição:', textStatus, errorThrown);
        });
    });

    // Função para excluir um servidor
    $(document).on('click', '.delete-btn', function() {
        const row = $(this).closest('tr');
        const id = row.data('id');

        const deleteSettings = {
            "async": true,
            "crossDomain": true,
            "url": `http://localhost:3000/servidores/deletar/${id}`,
            "method": "DELETE",
            "headers": {
                "Authorization": "Basic YWRtaW46c2VuaGExMjM="  // Base64 de admin:senha123
            }
        };

        $.ajax(deleteSettings).done(function() {
            row.remove(); // Remove a linha da tabela após a exclusão
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log('Erro na requisição:', textStatus, errorThrown);
        });
    });

    // Função para adicionar um novo servidor
    $('#cadastroForm').submit(function(event) {
        event.preventDefault();

        const novoServidor = {
            nome: $('#nome').val(),
            cargo: $('#cargo').val(),
            departamento: $('#departamento').val()
        };

        const postSettings = {
            "async": true,
            "crossDomain": true,
            "url": "http://localhost:3000/servidores/inserir",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Basic YWRtaW46c2VuaGExMjM="  // Base64 de admin:senha123
            },
            "processData": false,
            "data": JSON.stringify(novoServidor)
        };

        $.ajax(postSettings).done(function(response) {
            populateTable(); // Atualiza a tabela após o cadastro
            $('#cadastroForm')[0].reset(); // Limpa o formulário após o envio
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log('Erro na requisição:', textStatus, errorThrown);
        });
    });
});
