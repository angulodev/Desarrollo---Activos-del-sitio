const goData = async (nombreGrupo) => {
    return await $SP().whoami()
        .then(datos => isMemberGroup(datos.WorkEmail, nombreGrupo))
        .then(whereSP => obtenerMenu(whereSP))
        .then(oMenu => templateMenu(oMenu))
        .catch(e => console.log(e));
};


const obtenerMenu = async (isMember) => {
    const whereSP = (isMember) ? 'vigente = 1' : 'vigente = 1 AND audiencia=""';

    return await $SP().list('Menu').get({
        where: whereSP,
        json: true,
        fields: "Title,class,padre,ID,Order,link,vigente,audiencia",
        orderby: "Order ASC"
    }).then(resp => {
        sessionStorage.setItem('Menu', JSON.stringify(resp));
        return resp;
    })
        .catch(e => console.log(e));
};


const isMemberGroup = async (correoUsuarioConectado, nombreGrupo = '') => {

    let response = false;

    if (nombreGrupo) {
        await $SP().groupMembers(nombreGrupo)
            .then((members) => {
                const usuarioMiembro = members.filter(user => user.Email == correoUsuarioConectado);
                response = (usuarioMiembro != '') ? true : false;
            })
            .catch(e => {
                // console.log(e);
            });
    }

    return response;
};


const templateMenu = async (listadoMenu) => {

    const listadoPadres = listadoMenu.filter(pMenu => pMenu.padre == "#");

    let frag = '<ul class="">';

    for (const padreMenu of listadoPadres) {

        const listadoHijos = listadoMenu.filter(hMenu => hMenu.padre == padreMenu.Title);

        if (!listadoHijos.length) {
            let row = `<li id='${padreMenu.ID}' class="menu">          
                            <a href='${padreMenu.link}' class='d-block text-menu'>
                                <img src="../SiteAssets/img/${padreMenu.class}" alt="" srcset="">${padreMenu.Title}</a>
                            </li>`;
            frag += row;

        } else {


            // const icon = SVG(`../SiteAssets/img/${padreMenu.class}`);


            let row = `<li cl>
                            <label for="input${padreMenu.ID}" class='d-block text-menu'>
                                <img src="../SiteAssets/img/${padreMenu.class}" alt="" srcset="">
                                <span>
                                <svg width="24" height="14" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.73921 0.326523C1.36725 -0.0817272 0.734772 -0.11115 0.326523 0.260805C-0.0817272 0.63276 -0.11115 1.26524 0.260805 1.67349L9.72452 12.0607C10.9096 13.3614 12.9545 13.3676 14.1475 12.074L23.7351 1.67795C24.1095 1.27196 24.0839 0.639315 23.678 0.264896C23.272 -0.109524 22.6393 -0.0839306 22.2649 0.32206L12.6772 10.7182C12.2796 11.1493 11.5979 11.1473 11.2029 10.7137L1.73921 0.326523Z" fill="#002EFF"/>
                                </svg> 
                                </span>
                                ${padreMenu.Title}
                                </label>
                                <input type="checkbox" id="input${padreMenu.ID}"/>
                                <ul class='' id='${padreMenu.Title}_Submenu'>`;
            for (const hijoMenu of listadoHijos) {
                row += `<li id='${hijoMenu.ID}' class="menu">
                            <a href='${hijoMenu.link}' class='d-block text-menu'>
                                <img src="../SiteAssets/img/${hijoMenu.class}" alt="" srcset="">${hijoMenu.Title}</a>
                        </li>`;
            }
            row += `</ul></li>`;
            frag += row;
        }
    }


    return frag;
};


const comprobarUrl = () => {
    const href = window.location.href;
    pintarMenuActivo(href);
};



const compararMenu = async (menuLocal, domMenu, audiencia) => {

    const menuSP = await goData(audiencia);
    if (menuLocal != menuSP) {
        domMenu.innerHTML = menuSP;
        comprobarUrl();
    }

};



const pintarMenuActivo = (href) => {

    const liMenu = Array.from(document.getElementsByClassName('menu'));

    liMenu.forEach(menuActivo => {
        if (menuActivo.firstElementChild.href == href) {
            menuActivo.style.backgroundColor = '#ffffff';
            menuActivo.style.borderBottomLeftRadius = '5px';
            menuActivo.style.borderTopLeftRadius = '5px';
            menuActivo.style.borderTop = '1px solid #002EFF';
            menuActivo.style.borderBottom = '1px solid #002EFF';
            menuActivo.firstElementChild.style.color = '#002EFF';

            if (menuActivo.parentElement.id.includes('_Submenu')) {
                const subMenu = menuActivo.parentElement.previousElementSibling;
                subMenu.click();
            }
        }
    });

};
