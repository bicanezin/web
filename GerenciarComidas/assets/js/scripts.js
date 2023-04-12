var page = 0;
var pageSize = 3;

/**
 * Search all foods in the database and fill in the table with the data returned
 */
function getAllFoodsAndFillTable() {
  $.ajax({
    url: "http://localhost:3000/foods",
    type: "GET",

    success: function(allFoods) {
      fillTable({ data: allFoods });
      pageButtons({ data: allFoods });
    },

    error: function(error) {
      console.log(error);
    }
  });
}

/**
 * Fill tables with the data returned from the query.
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
      `<td>${data[index].nome}</td>` +
      `<td>${data[index].descricao}</td>` +
      `<td>${data[index].preco}</td>` +
      `<td>${data[index].categoria_id}</td>` +
      `<td><button type="button" onclick="fillAndOpenModal({ foodID: ${data[index].id} })" class="btn btn-light"><img src="assets/images/pencil-icon.png" width="23" height="23" /></button></td>` +
      `<td><button type="button" onclick="deleteAFood({ foodID: ${data[index].id} })" class="btn btn-light"><img src="assets/images/trash-icon.png" width="23" height="23" /></button></td>` +
      "</tr>";

    $(".table > tbody > tr:last").after(newLine);
  }

  $("#numbering").text(
    "Página " + (page + 1) + " de " + Math.ceil(data.length / pageSize)
  );
}

/**
 * Clears data listed in table to leverage structure when searching
 */
function clearTable() {
  $(".table > tbody > tr").remove();

  // insert a TR tag to not lose a reference in the table
  $(".table > tbody").append("<tr></tr>");
}

/**
 * Fill modal with the data and open it
 */
function fillAndOpenModal({ foodID }) {
  $.ajax({
    url: `http://localhost:3000/foods/${foodID}`,
    type: "GET",

    success: function(food) {
      $("#foodID").val(`${food.id}`);
      $("#foodName").val(`${food.nome}`);
      $("#foodDescription").val(`${food.descricao}`);
      $("#foodPrice").val(`${food.preco}`);
      $("#foodCategory").val(`${food.categoria_id}`);

      clearField({ elementID: "#foodName" });
      clearField({ elementID: "#foodDescription" });
      clearField({ elementID: "#foodPrice" });
      clearField({ elementID: "#foodCategory" });

      $("#modalUpdateFood").modal("show");
    },

    error: function(error) {
      console.log(error);
    }
  });
}

/**
 * Responsible for reloading the page when necessary
 */
function realoadPage() {
  $(document).ready(function() {
    location.reload();
  });
}

/**
 * Field validation and verification
 */
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
  foodID,
  foodName,
  foodDescription,
  foodPrice,
  foodCategory
}) {
  if (
    foodName !== "" &&
    foodPrice !== "" &&
    foodCategory !== "" &&
    foodCategory !== "Escolher..."
  ) {
    updateAFood({ foodID, foodName, foodDescription, foodPrice, foodCategory });
  }

  if (foodName === "") {
    markRequiredField({ elementID: "#foodName" });
  }

  if (foodPrice === "") {
    markRequiredField({ elementID: "#foodPrice" });
  }

  if (foodCategory === "" || foodCategory === "Escolher...") {
    markRequiredField({ elementID: "#foodCategory" });
  }
}

function validateFieldsToCreate() {
  const foodName = $("#foodName").val();
  const foodDescription = $("#foodDescription").val();
  const foodPrice = $("#foodPrice").val();
  const foodCategory = $("#foodCategory").val();

  if (
    foodName !== "" &&
    foodPrice !== "" &&
    foodCategory !== "" &&
    foodCategory !== "Escolher..."
  ) {
    createAFood({ foodName, foodDescription, foodPrice, foodCategory });
  }

  if (foodName === "") {
    markRequiredField({ elementID: "#foodName" });
  }

  if (foodPrice === "") {
    markRequiredField({ elementID: "#foodPrice" });
  }

  if (foodCategory === "" || foodCategory === "Escolher...") {
    markRequiredField({ elementID: "#foodCategory" });
  }
}

function validateFieldSearch() {
  const searchFood = $("#searchFood").val();

  if (searchFood === "") {
    $("#searchFood")
      .css("border-color", "red")
      .css("background-color", "pink");
  } else {
    clearTable();

    $("#searchFood")
      .css("border-color", "#ced4da")
      .css("background-color", "white");

    searchByFoodName({ foodName: searchFood });
  }
}

/**
 * Delete a food in the database
 */
function deleteAFood({ foodID }) {
  $.ajax({
    url: `http://localhost:3000/foods/${foodID}`,
    type: "DELETE",

    success: function() {
      Swal.fire({
        title: "Você tem certeza que deseja excluir essa comida?",
        text: "Não tem como reverter essa ação!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#99cc00",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sim, deletar",
        cancelButtonText: "Cancelar"
      }).then(result => {
        if (result.value) {
          Swal.fire("Sucesso", "Comida deletada com sucesso!", "success").then(
            () => {
              realoadPage();
            }
          );
        }
      });
    },

    error: function() {
      Swal.fire("Erro", "Ocorreu um erro ao deletar a comida!", "error");
    }
  });
}

/**
 * Update a food in the database
 */
function updateAFood({
  foodID,
  foodName,
  foodDescription,
  foodPrice,
  foodCategory
}) {
  $.ajax({
    url: `http://localhost:3000/foods/${foodID}`,
    type: "PUT",
    data: {
      id: foodID,
      nome: foodName,
      descricao: foodDescription,
      preco: parseFloat(foodPrice),
      categoria_id: parseInt(foodCategory)
    },

    success: function() {
      Swal.fire("Sucesso", "Comida atualizada com sucesso!", "success").then(
        () => {
          realoadPage();
        }
      );
    },

    error: function() {
      Swal.fire("Erro", "Ocorreu um erro ao atualizar a comida!", "error");
    }
  });
}

/**
 * Create a food in the database
 */
function createAFood({ foodName, foodPrice, foodCategory, foodDescription }) {
  $.ajax({
    method: "POST",
    url: "http://localhost:3000/foods",
    data: {
      nome: foodName,
      descricao: foodDescription,
      preco: parseFloat(foodPrice),
      categoria_id: parseInt(foodCategory)
    },

    success: function() {
      Swal.fire({
        title: "Sucesso",
        icon: "success",
        text: "Comida cadastrada com sucesso!",
        showCancelButton: true,
        cancelButtonColor: "#808080",
        buttonsStyling: true,
        cancelButtonText: "Voltar para página inicial",
        confirmButtonText: "Cadastrar mais"
      }).then(result => {
        if (result.value) {
          realoadPage();
        } else {
          window.location.href = "home.html";
        }
      });
    },

    error: function() {
      Swal.fire("Erro", "Ocorreu um erro ao deletar a comida!", "error");
    }
  });
}

/**
 * Search by food name in database
 */
function searchByFoodName({ foodName }) {
  $.ajax({
    url: `http://localhost:3000/foods?nome=${foodName}`,
    type: "GET",

    success: function(food) {
      fillTable({ data: food });
      Swal.fire("Sucesso", "Pesquisa realizada com sucesso", "success");
    },

    error: function() {
      Swal.fire("Erro", "Ocorreu um erro ao realizar a pesquisa", "error");
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
        getAllFoodsAndFillTable();
        pageButtons();
      }
    });

    $("#anterior").click(function() {
      if (page > 0) {
        page--;
        getAllFoodsAndFillTable();
        pageButtons();
      }
    });

    pageButtons();
  });
}
