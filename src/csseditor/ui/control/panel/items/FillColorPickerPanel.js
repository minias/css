import UIElement from "../../../../../util/UIElement";
import FillColorPicker from "./color/FillColorPicker";

export default class FillColorPickerPanel extends UIElement {
    template () {
        return `
            <div class='property-item fill-colorpicker show'>
                <div class='items'>            
                    <FillColorPicker></FillColorPicker>
                </div>
                <div class='items bar'></div>
            </div>
        `
    }

    components() {
        return { FillColorPicker }
    }

}