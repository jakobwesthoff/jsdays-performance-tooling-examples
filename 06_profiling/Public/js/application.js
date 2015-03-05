(function($, document, window, undefined) {
    var rowFragment;

    function createTileFragment() {
        var tileFragment = document.createElement("div");
        tileFragment.setAttribute("class", "col-md-2");
        tileFragment.style.width = "128px";
        tileFragment.style.height = "128px";
        tileFragment.style.margin = "2px";
        tileFragment.style.background = "orange";
        return tileFragment;
    }

    function createRow() {
        var rowFragment = document.createElement("div");
        rowFragment.setAttribute("class", "row");
        return rowFragment;
    }

    function addPositionToTile(tileFragment) {
        var boundingRect = tileFragment.getBoundingClientRect();
        tileFragment.textContent = boundingRect.left + "x" + boundingRect.top;
    }

    function addTransparencyToTile(tileFragment) {
        var compStyle = window.getComputedStyle(tileFragment);
        var color = compStyle.backgroundColor;
        var green = color.split("(", 2)[1].split(",")[1] / 255;
        tileFragment.style.opacity = 0.5 + 0.5 * green;
    }

    function attachEventHandler(tileFragment) {
        tileFragment.addEventListener("click", function(ev) {
            var compStyle = window.getComputedStyle(tileFragment);
            var oldBackground = compStyle.background;
            tileFragment.style.background = "url(images/jslogo.png) top left / contain";
            setTimeout(function() {
                tileFragment.style.background = oldBackground;
            }, 2000);
        })
    }
    
    function initializeMemory(container, tileCount) {
        var tilesPerRow = 6;
        var i;
        var tileFragment;
        var boundingRect;
        var transparency;

        var overAllTransparency = 0;

        for (i=0; i<tileCount; i++) {
            if(rowFragment === undefined || i % tilesPerRow === 0) {
                rowFragment = createRow();
                container.appendChild(rowFragment);
            }
            tileFragment = createTileFragment();

            rowFragment.appendChild(tileFragment);

            addTransparencyToTile(tileFragment);
            addPositionToTile(tileFragment);

            overAllTransparency += parseFloat(tileFragment.style.opacity);
            
            attachEventHandler(tileFragment);
        }
        console.log("Overall transparency is %i%%", overAllTransparency/tileCount * 100);
    }

    $(document).ready(function() {
        console.profile("Init Memory");
        initializeMemory(document.getElementById("memory-container"), 3600);
        console.profileEnd("Init Memory");
    });

}(jQuery, document, window));
