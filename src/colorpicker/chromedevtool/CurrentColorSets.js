import Dom from '../../util/Dom'
import EventMachin from '../../util/EventMachin'

export default class CurrentColorSets extends EventMachin {
    constructor (colorpicker) {
        super();

        this.colorpicker = colorpicker; 

        this.colorSetsList = this.colorpicker.colorSetsList;

        this.initialize();
    } 

    template() {
        return `
            <div class="colorsets">
                <div class="menu" title="Open Color Palettes">
                    <button ref="$colorSetsChooseButton" type="button" class="color-sets-choose-btn arrow-button"></button>
                </div>
                <div ref="$colorSetsColorList" class="color-list"></div>
            </div>
        `
    }    
    
    'load $colorSetsColorList' () {
        const currentColorSets  = this.colorSetsList.getCurrentColorSets()
        const colors  = this.colorSetsList.getCurrentColors()

        return `
            <div class="current-color-sets">
            ${colors.map( (color, i) => {
                return `<div class="color-item" title="${color}" data-index="${i}" data-color="${color}">
                    <div class="empty"></div>
                    <div class="color-view" style="background-color: ${color}"></div>
                </div>`
            }).join('')}   
            ${currentColorSets.edit ? `<div class="add-color-item">+</div>` : ''}         
            </div>
        `
    }    

    initialize () {
        this.load()
    }

    refreshAll () {
        this.load();
        this.colorpicker.refreshColorSetsChooser();        
    }

    addColor (color) {
        this.colorSetsList.addCurrentColor(color);
        this.refreshAll();
    }

    removeColor (index) {
        this.colorSetsList.removeCurrentColor(index);
        this.refreshAll();
    }

    removeAllToTheRight (index) {
        this.colorSetsList.removeCurrentColorToTheRight(index);
        this.refreshAll();
    }

    clearPalette () {
        this.colorSetsList.clearPalette();
        this.refreshAll();
    }

    'click $colorSetsChooseButton' (e) {
        this.colorpicker.toggleColorChooser();
    }

    'contextmenu $colorSetsColorList' (e) {
        e.preventDefault();
        const currentColorSets  = this.colorSetsList.getCurrentColorSets()

        if (!currentColorSets.edit) {
            return; 
        }

        const $target = new Dom(e.target);
        
        const $item = $target.closest('color-item');

        if ($item) {
            const index = parseInt($item.attr('data-index'));
            
            this.colorpicker.showContextMenu(e, index);
        } else {
            this.colorpicker.showContextMenu(e);
        }
    }

    'click $colorSetsColorList .add-color-item' (e) {
        this.addColor(this.colorpicker.getCurrentColor());
    }

    'click $colorSetsColorList .color-item'  (e) {

        const isDirect = !!this.colorpicker.isPaletteType(); 

        this.colorpicker.setColor(e.$delegateTarget.attr('data-color'), isDirect);
    }

}
