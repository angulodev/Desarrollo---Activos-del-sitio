'use strict';

function Menu({ objMenu }) {

    return (
        <ul>
            <ListadoItems listadoMenu={objMenu} />
        </ul>
    );
}

function ListadoItems({ listadoMenu }) {
    const listadoPadres = listadoMenu.filter(pMenu => pMenu.padre === "#");

    let listMenu = [];

    for (const menuPadre of listadoPadres) {
        const listHijos = listadoMenu.filter(hMenu => hMenu.padre === menuPadre.Title);

        if (listHijos.length === 0) {
            listMenu.push(
                <li key={menuPadre.ID} className="list-unstyled components">
                    <a href={menuPadre.link} className='d-block text-menu py-2 border-0'>
                        <span className={menuPadre.class + 'icono mr-2'}></span>
                        {menuPadre.Title}
                    </a>
                </li>);
        } else {

            listMenu.push(
                <li key={menuPadre.ID} className="list-unstyled components">
                    <a href={'#' + menuPadre.Title + '_Submenu'} data-toggle='collapse' aria-expanded='false'
                        className='dropdown-toggle d-block text-menu py-2 border-0'>
                        <span className={menuPadre.class + 'py-2 icono mr-2'}></span>
                        {menuPadre.Title}
                    </a>
                    <ul className='collapse list-unstyled' id={menuPadre.Title + '_Submenu'}>
                        <ListadoHijos listHijos={listHijos} />
                    </ul>
                </li>
            );
        }

    }

    return (
        <React.Fragment>
            {listMenu}
        </React.Fragment>
    );
}


function ListadoHijos({ listHijos }) {

    console.log(listHijos);

    return (<li></li>);

}