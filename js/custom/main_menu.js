addEventListener('load', async () => {
    comprobarSesionStorage();
});


async function comprobarSesionStorage() {
    const domMenu = document.getElementById('menu');

    const menuLocal = JSON.parse(sessionStorage.getItem('Menu'));

    // comprobar si existe un menu en sesion storage
    if (menuLocal === null) {
        // nombre de grupo para hacer el filtro de audiencia
        const menu = await goData('adm');
        domMenu.innerHTML = menu;
        comprobarUrl();

    } if (menuLocal) {
        // cargar menu
        const menu = await templateMenu(menuLocal);
        domMenu.innerHTML = menu;
        comprobarUrl();

        // comparar menu , se envia menu local , audiencia y id menu 
        compararMenu(menu, domMenu, '');
    }
};






