var page = 0; // INICIALMENTE O NUMERO DE PÁGINAS
var pageSize = 4; // QUANTIDADE DE ITENS POR PÁGINA

/**
 * PEGA TODOS OS ITENS PRA COLOCAR NA TABELA
 */
function getAllPersonsAndFillTable() {
  $.ajax({
    url: "http://localhost:3000/persons",
    type: "GET",

    success: function(allpersons) {
      fillTable({ data: allpersons });
      pageButtons({ data: allpersons });
    },

    error: function(error) {
      console.log(error);
    }
  });
}

/**
 * PREENCHE A TABELA
 */
function fillTable({ data }) {
  clearTable();

  for (
    var index = page * pageSize;
    index < data.length && index < (page + 1) * pageSize;
    index++
  ) {
    newLine =
      "<tr>" +
      `<th scope="row">${data[index].id}</th>` +
      `<td>${data[index].name}</td>` +
      `<td>${data[index].number}</td>` +
      `<td><button type="button" onclick="fillAndOpenModal({ personsID: ${data[index].id} })" class="btn btn-light"><i class="fas fa-edit"></i></button></td>` +
      `<td><button type="button" onclick="deletePerson({ personsID: ${data[index].id} })" class="btn btn-light"><i class="fas fa-trash"></i></button></td>` +
      "</tr>";

    $(".table > tbody > tr:last").after(newLine);
  }

  $("#numbering").text(
    "Página " + (page + 1) + " de " + Math.ceil(data.length / pageSize)
  );
}


function clearTable() {
  $(".table > tbody > tr").remove();

  $(".table > tbody").append("<tr></tr>");
}


function fillAndOpenModal({ personsID }) {
  $.ajax({
    url: `http://localhost:3000/persons/${personsID}`,
    type: "GET",

    success: function(persons) {
      $("#personsID").val(`${persons.id}`);
      $("#personsName").val(`${persons.name}`);
      $("#personsNumber").val(`${persons.number}`);

      clearField({ elementID: "#personsName" });
      clearField({ elementID: "#personsNumber" });

      $("#modalUpdatepersons").modal("show");
    },

    error: function(error) {
      console.log(error);
    }
  });
}


function realoadPage() {
  $(document).ready(function() {
    location.reload();
  });
}


function clearField({ elementID }) {
  $(`${elementID}`)
    .css("border-color", "#ced4da")
    .css("background-color", "white");

  $("#requiredFields").css("visibility", "hidden");
}

function markRequiredField({ elementID }) {
  $(`${elementID}`)
    .css("border-color", "red")
    .css("background-color", "pink");

  $("#requiredFields").css("visibility", "visible");
}

function validateFieldsToUpdate({
  personsID,
  personsName,
  personsNumber
}) {
  if (
    personsName !== "" &&
    personsNumber !== ""
  ) {
    updateApersons({ personsID, personsName, personsNumber});
  }

  if (personsName === "") {
    markRequiredField({ elementID: "#personsName" });
  }

  if (personsNumber === "") {
    markRequiredField({ elementID: "#personsNumber" });
  }
}

function validateFieldsToCreate() {
  const personsName = $("#personsName").val();
  const personsNumber = $("#personsNumber").val();

  if (
    personsName !== "" &&
    personsNumber !== ""
  ) {
    createApersons({ personsName, personsNumber });
  }

  if (personsName === "") {
    markRequiredField({ elementID: "#personsName" });
  }

  if (personsNumber === "") {
    markRequiredField({ elementID: "#personsNumber" });
  }

}

function validateFieldSearch() {
  const searchpersons = $("#searchpersons").val();

  if (searchpersons === "") {
    $("#searchpersons")
      .css("border-color", "red")
      .css("background-color", "pink");
  } else {
    clearTable();

    $("#searchpersons")
      .css("border-color", "#ced4da")
      .css("background-color", "white");

    searchBypersonsName({ personsName: searchpersons });
  }
}


function deletePerson({ personsID }) {
  $.ajax({
    url: `http://localhost:3000/persons/${personsID}`,
    type: "DELETE",

    success: function() {
      Swal.fire({
        title: "Você tem certeza que deseja excluir essa pessoa?",
        text: "Não tem como reverter essa ação!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ADFF2F",
        cancelButtonColor: "#808080",
        confirmButtonText: "Excluir",
        cancelButtonText: "Cancelar"
      }).then(result => {
        if (result.value) {
          Swal.fire("Sucesso", "Deletado", "success").then(
            () => {
              realoadPage();
            }
          );
        }
      });
    },

    error: function() {
      Swal.fire("Erro", "Ocorreu um erro ao deletar essa pessoa!", "error");
    }
  });
}


function updateApersons({
  personsID,
  personsName,
  personsNumber
}) {
  $.ajax({
    url: `http://localhost:3000/persons/${personsID}`,
    type: "PUT",
    data: {
      id: personsID,
      name: personsName,
      number: personsNumber,
    },

    success: function() {
      Swal.fire("Sucesso", "atualizado", "success").then(
        () => {
          realoadPage();
        }
      );
    },

    error: function() {
      Swal.fire("Erro", "Erro ao atualizar", "error");
    }
  });
}


function createApersons({ personsName, personsNumber }) {
  $.ajax({
    method: "POST",
    url: "http://localhost:3000/persons",
    data: {
      name: personsName,
      number: personsNumber
    },

    success: function() {
      Swal.fire({
        title: "Sucesso",
        icon: "success",
        text: "Pessoa cadastrada!",
        showCancelButton: true,
        cancelButtonColor: "#808080",
        buttonsStyling: true,
        cancelButtonText: "Página inicial",
        confirmButtonText: "Adicionar"
      }).then(result => {
        if (result.value) {
          realoadPage();
        } else {
          window.location.href = "/";
        }
      });
    },

    error: function() {
      Swal.fire("Erro", "Erro na Remoção", "error");
    }
  });
}


function searchBypersonsName({ personsName }) {
  page = 0;
  $.ajax({
    url: `http://localhost:3000/persons?name=${personsName}`,
    type: "GET",

    success: function(persons) {
      fillTable({ data: persons });
      Swal.fire("Sucesso", "Pesquisado", "success");
    },

    error: function() {
      Swal.fire("Erro", "Erro na pesquisa", "error");
    }
  });
}

function pageButtons({ data }) {
  $("#proximo").prop(
    data.length <= pageSize || page >= Math.ceil(data.length / pageSize) - 1
  );

  $("#anterior").prop(data.length <= pageSize || page == 0);

  $(function() {
    $("#proximo").click(function() {
      if (page < data.length / pageSize - 1) {
        page++;
        getAllPersonsAndFillTable();
        pageButtons();
      }
    });

    $("#anterior").click(function() {
      if (page > 0) {
        page--;
        getAllPersonsAndFillTable();
        pageButtons();
      }
    });

    pageButtons();
  });
}
