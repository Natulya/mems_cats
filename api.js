const wrapper = document.querySelector(".wrapper");
const modalWr = document.querySelector('[data-modalWr]');
const modalContent = document.querySelector('[data-modalContent]');
console.log(modalWr, modalContent);
const CREATE_FORM_lS_KEY = "CREATE_FORM_lS_KEY"; 

const getCreateCatFormHTML = () => `<h3>Добавить котика</h3>
<form name="createCatForm">
    <div>
        <input type="number" name="id" placeholder="ID" required>
    </div>
    <div>
        <input type="text" name="name" placeholder="Name" required>
    </div>
    <div>
        <input type="text" name="image" placeholder="Image url">
    </div>
    <div>
        <input type="number" name="age" placeholder="Age">
    </div>
    <div>
        <input type="text" name="description" placeholder="Description">
    </div>
    <div>
        <input type="range" name="rate" min="1" max="10">
    </div>
    <div>
        <input 
        type="checkbox" 
        name="favorite" 
        id="modalCreateCat"
        >
        <label for="modalCreateCat">favorite</label>
    </div>
    <button type="submit">Добавить</button>

</form>`;

const actions = {
    detail: "detail",
    delete: "delete",
}

const getCatHTML = (cat) => {

    return `
    <div data-id="${cat.id}" class="card">
            <h3>Кот ${cat.name}</h3>
            <img src="${cat.image}" alt="${cat.name}" >
            <p>Полных лет: ${cat.age}</p>
            <p>Рейтинг: ${cat.rate} из 10</p>
            <button data-action="${actions.detail}">Подробнее</button> 
            <button data-action="${actions.delete}">Удалить</button> 
        </div>
    `
}


fetch("https://cats.petiteweb.dev/api/single/Natulya/show/")
  .then((response) => response.json())
  .then((data) => {

    wrapper.insertAdjacentHTML("afterbegin", data.map(cat => getCatHTML(cat)).join(""));
    
    // console.log({data})
});

wrapper.addEventListener("click", (e) => {
    if(e.target.dataset.action === actions.delete) {
        const catWr = e.target.closest("[data-id]");
        const catId = catWr.dataset.id; 

        fetch(`https://cats.petiteweb.dev/api/single/Natulya/delete/${catId}`, {
            method: "DELETE",
        })
        .then((res) => {
            if (res.status === 200) {
                return catWr.remove()
            }

            alert(`Удаление кота с id = ${catId} не удалось`)
        })
    }
})

const formatCreateFormData = (formDataObject) => {
    return {
        ...formDataObject,
        id: +formDataObject.id,
        rate: +formDataObject.rate,
        age: +formDataObject.age,
        favorite: !!formDataObject.favorite
    }
}

const submitCreateCatHandler = (e) => {
    e.preventDefault();
    // console.log(e);
    let formDataObject = formatCreateFormData(Object.fromEntries(new FormData(e.target).entries()));

    // const showCreateCatError = () => alert("Ошибка при создании кота");
   
    // console.log({formDataObject});

    formDataObject = fetch("https://cats.petiteweb.dev/api/single/Natulya/add/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json" 
        },
        body: JSON.stringify(formDataObject)

    }).then((res) => {
        if (res.status === 200) {
        return wrapper.insertAdjacentHTML(
        "afterbegin",
        getCatHTML(formDataObject));
        }

        showCreateCatError()
    }).catch(showCreateCatError)
}

const clickModalWrHendler = (e) => {
    if(e.target === modalWr) {
        modalWr.classList.add("hidden");
        // createCatForm.removeEventListener("submit", submitCreateCatHandler);
        modalWr.removeEventListener("click", clickModalWrHendler); 
        modalContent.innerHTML = ""; 
    }

}

const openModalHendler = (e) => {
    const targetModalName = e.target.dataset.openmodal;

    if (targetModalName === "createCat") {
        modalWr.classList.remove("hidden");
        modalWr.addEventListener("click", clickModalWrHendler);
        modalContent.insertAdjacentHTML("afterbegin", getCreateCatFormHTML());
        const createCatForm = document.forms.createCatForm;
        const dataFromLS = localStorage.getItem(CREATE_FORM_lS_KEY);
        const preparedDataFromLS = dataFromLS && JSON.parse(dataFromLS);
        // console.log({ preparedDataFromLS });
        
        if (preparedDataFromLS) {
            Object.keys(preparedDataFromLS).forEach((key) => {
                createCatForm[key].value = preparedDataFromLS[key];
            })
        }

        createCatForm.addEventListener("submit", submitCreateCatHandler);
        createCatForm.addEventListener("change", (eventChang) => {
            let formattedData = formatCreateFormData(Object.fromEntries(new FormData(createCatForm).entries()));
            
            localStorage.setItem(CREATE_FORM_lS_KEY, JSON.stringify(formattedData));
        });

    }
}

document.addEventListener("click", openModalHendler);

document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") {
        modalWr.classList.add("hidden");
        // createCatForm.removeEventListener("submit", submitCreateCatHandler);
        modalWr.removeEventListener("click", clickModalWrHendler);
        modalContent.innerHTML = "";  
    }
})

