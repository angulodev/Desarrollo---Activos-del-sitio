
 
        function myFunction(idButton) {
            var clic =0;
            clic++;
            var Div1 = document.getElementById('Div1');
            var Div2 = document.getElementById('Div2');
            var btn = document.getElementById('btn');
            
            console.log(clic)
            clic = clic<3 ? clic : 1

            switch(clic) {
               case 1:
               Div1.style.display = 'block';
               Div2.style.display = 'none';
               
               
               break;

               case 2:
               Div1.style.display = 'block';
               Div2.style.display = 'block';
               
               break;

               case 3:
               Div1.style.display = 'block';
               Div2.style.display = 'block';
               
               
               break;

               default:
               alert("error.")
           }

       }