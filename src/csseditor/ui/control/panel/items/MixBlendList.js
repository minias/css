import BasePropertyItem from './BasePropertyItem';

export default class MixBlendList extends BasePropertyItem {

    template () { 
        return `
            <div class='property-item mix-blend-list'>
                <div class='title' ref="$title">Mix Blend - <span class='description' ref="$desc"></span></div>
                <div class='items max-height'>                    
                    <div class='mix-blend-list blend-list-tab'>
                        <div class="blend-list" ref="$mixBlendList"></div>            
                    </div>   
                </div>
            </div>
        `
    }

    'load $mixBlendList' () {
        var list = this.read('/blend/list')
        var item = this.read('/item/current/layer')
        if (!item) { return ''; }

        return  `<div>${list.map((blend) => {

                    var selected = blend == item.mixBlendMode ? 'selected' : '' 
                    return `
                        <div class='blend-item ${selected}' data-mode="${blend}">
                            <div class="blend-item-view-container">
                                <div class="blend-item-blend-view"  style='${this.read('/blend/toStringWithoutDimension', item, blend)}'></div>
                                <div class="blend-item-text">${blend}</div>
                            </div>
                        </div>`
                }).join('')}</div>`
    }



    isShow () {
        var image = this.read('/item/current/image')

        if (image) return false; 

        return true; 
    }    

    refresh () {

        var isShow = this.isShow();

        this.$el.toggle(isShow);

        if(isShow && this.parent.selectedTabId == 'mix') {
            this.load()

            this.read('/item/current/layer', (layer) => {
                this.refs.$desc.text(layer.mixBlendMode)
            })        
        }
    }

    show () {
        this.refresh();
    }

    '@changeEditor' () {
        if (this.$store.lastChangedItemType == 'layer') {
            this.refresh()
        }
    }

    'click $mixBlendList .blend-item | self' (e) {
        var item = this.read('/item/current/layer');

        if (!item) return; 
        
        item.mixBlendMode = e.$delegateTarget.attr('data-mode')

        this.dispatch('/item/set', item, true)

        this.refresh();
    } 

}