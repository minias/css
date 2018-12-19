import UIElement, { MULTI_EVENT } from '../../../../colorpicker/UIElement';
import { parseParamNumber } from '../../../../util/filter/functions';
import { 
    EVENT_CHANGE_EDITOR, 
    EVENT_CHANGE_LAYER_SIZE, 
    EVENT_CHANGE_LAYER_POSITION, 
    CHANGE_LAYER_SIZE, 
    CHANGE_LAYER_ROTATE,
    EVENT_CHANGE_LAYER_TRANSFORM, 
    EVENT_CHANGE_SELECTION, 
    EVENT_CHANGE_LAYER_MOVE,
    EVENT_CHANGE_LAYER_ROTATE,
    EVENT_CHANGE_PAGE_SIZE
} from '../../../types/event';
import { caculateAngle } from '../../../../util/functions/math';
import { px, UNIT_PX } from '../../../../util/css/types';

const SNAP_GRID = 20; 

const SEGMENT_TYPE_ROTATE = 'rotate';
const SEGMENT_TYPE_MOVE = 'move';
const SEGMENT_TYPE_TOP = 'to top';
const SEGMENT_TYPE_LEFT = 'to left';
const SEGMENT_TYPE_RIGHT = 'to right';
const SEGMENT_TYPE_BOTTOM = 'to bottom';
const SEGMENT_TYPE_TOP_RIGHT = 'to top right';
const SEGMENT_TYPE_TOP_LEFT = 'to top left';
const SEGMENT_TYPE_BOTTOM_RIGHT = 'to bottom right';
const SEGMENT_TYPE_BOTTOM_LEFT = 'to bottom left';

export default class PredefinedGroupLayerResizer extends UIElement {


    initialize () {
        super.initialize()

        this.$board = this.parent.refs.$board;
        this.$canvas = this.parent.refs.$canvas;
        this.$page = this.parent.refs.$page; 
    }

    template () { 
        return `<div class="predefined-group-resizer"></div>`
    } 

    'load $el' () {

        var layers = this.read('/selection/current/layer');
        var isImage = this.read('/selection/is/image');

        if (!layers) return '';

        if (Array.isArray(layers) == false) {
            layers = [layers]
        }

        return layers.map(item => { 
            var css = this.setRectangle(item);
            var image = isImage ? 'image' : ''; 
            return ` 
                <div class="predefined-layer-resizer ${image}" predefined-layer-id="${item.id}" style="${this.read('/css/toString', css)}" >
                    <div class="event-panel" data-value="${SEGMENT_TYPE_MOVE}"></div>
                    <div class='button-group' predefined-layer-id="${item.id}">
                        <button type="button" data-value="${SEGMENT_TYPE_RIGHT}"></button>
                        <button type="button" data-value="${SEGMENT_TYPE_LEFT}"></button>
                        <button type="button" data-value="${SEGMENT_TYPE_TOP}"></button>
                        <button type="button" data-value="${SEGMENT_TYPE_BOTTOM}"></button>
                        <button type="button" data-value="${SEGMENT_TYPE_TOP_RIGHT}"></button>
                        <button type="button" data-value="${SEGMENT_TYPE_BOTTOM_RIGHT}"></button>
                        <button type="button" data-value="${SEGMENT_TYPE_BOTTOM_LEFT}"></button>
                        <button type="button" data-value="${SEGMENT_TYPE_TOP_LEFT}"></button>
                    </div>
                    <button type='button' data-value='${SEGMENT_TYPE_ROTATE}'></button>         
                    
                    
                </div> 
            `
        })
    }


    setRectangle ({x, y, width, height, id}) {
        var boardOffset = this.boardOffset || this.$board.offset()
        var pageOffset = this.pageOffset || this.$page.offset()
        var canvasScrollLeft = this.canvasScrollLeft || this.$board.scrollLeft();
        var canvasScrollTop = this.canvasScrollTop || this.$board.scrollTop();

        x = px( parseParamNumber(x, x => x + pageOffset.left - boardOffset.left + canvasScrollLeft) ); 
        y = px( parseParamNumber(y, y => y + pageOffset.top - boardOffset.top  + canvasScrollTop) ); 

        var transform = "none"; 
        
        if (id) {
            transform = this.read('/layer/make/transform', this.read('/item/get', id));
        }

        return { 
            width, height, 
            left: x, top: y, 
            transform
        }
    }

    refresh () {
        var isShow = this.isShow();
        this.$el.toggle(isShow).attr('line-type', this.read('/selection/type'))

        if (isShow) {
            this.load()
        }
    }

    caculatePosition (list, key, align, unit = UNIT_PX ) {

        var valueList = list.filter(it => it.align == align).map(it => it[key])

        if (valueList.length) {
            return Math.max(  Number.MIN_SAFE_INTEGER,  ...valueList )
        }

        return undefined;
    }    

    isShow () {
        return this.read('/selection/is/not/empty')
    }

    [MULTI_EVENT(
        EVENT_CHANGE_LAYER_TRANSFORM,
        EVENT_CHANGE_LAYER_SIZE,
        EVENT_CHANGE_LAYER_ROTATE,
        EVENT_CHANGE_LAYER_MOVE,
        EVENT_CHANGE_LAYER_POSITION,
        EVENT_CHANGE_EDITOR,
        EVENT_CHANGE_SELECTION,
        EVENT_CHANGE_PAGE_SIZE
    )] () { this.refresh() }

    caculateRightSize (item, list) {
        var x = this.caculatePosition(list, 'x', 'right')

        if (typeof x != 'undefined') {
            var newWidth = Math.abs(this.moveX - parseParamNumber(x))
            item.width = newWidth; 
        }
    }

    caculateLeftSize (item, list) {
        var x = this.caculatePosition(list, 'x', 'left')

        if (typeof x != 'undefined') {
            var newWidth = this.width + (this.moveX - parseParamNumber(x))

            item.x = x 
            item.width = newWidth; 
        }
    }

    caculateBottomSize (item, list) {
        var y = this.caculatePosition(list, 'y', 'bottom')

        if (typeof y != 'undefined') {
            var newHeight = Math.abs(this.moveY - parseParamNumber(y));
            item.height = newHeight; 
        }
    }

    caculateTopSize (item, list) {
        var y = this.caculatePosition(list, 'y', 'top')

        if (typeof y != 'undefined') {
            var newHeight = this.height + (this.moveY - parseParamNumber(y))

            item.y = y 
            item.height = newHeight; 
        }
    }

    cacualteSizeItem (item, list) {
        if (this.currentType == 'to right') {   // 오른쪽 왼쪽 크기를 맞추기 
            this.caculateRightSize(item, list);
        } else if (this.currentType == 'to bottom') {   // 아래위 크기 맞추기 
            this.caculateBottomSize(item, list);
        } else if (this.currentType == 'to bottom left') {   // 아래위 크기 맞추기 
            this.caculateBottomSize(item, list);
            this.caculateLeftSize(item, list);
        } else if (this.currentType == 'to bottom right') {   // 아래위 크기 맞추기 
            this.caculateBottomSize(item, list);
            this.caculateRightSize(item, list);
        } else if (this.currentType == 'to left') {
            this.caculateLeftSize(item, list)
        } else if (this.currentType == 'to top') {
            this.caculateTopSize(item, list);
        } else if (this.currentType == 'to top right') {
            this.caculateTopSize(item, list);
            this.caculateRightSize(item, list);
        } else if (this.currentType == 'to top left') {
            this.caculateTopSize(item, list);
            this.caculateLeftSize(item, list);
        }
    }

    caculateSnap () {

        var list = this.read('/guide/line/layer', 3);

        if (list.length) {
            this.cacualteSizeItem(item, list);
        }

        return item; 
    }

    setPosition() {
        this.$el.children().forEach($el => {
            var item = this.read('/item/get', $el.attr('predefined-layer-id'));

            $el.cssText(this.read('/css/toString', this.setRectangle(item)));
        })
    }

    updatePosition (items) { 
        this.setPosition();
    }


    toRight (item) {
        var {dx} = this;

        this.run('/item/set', {
            id: item.id,
            width: px (item.width + dx)
        });            
    }

    toLeft (item) { 
        var {dx} = this;

        this.run('/item/set', {
            id: item.id,
            width: px (item.width - dx),
            x: px (item.x + dx)
        });            
    }    

    toBottom (item) {
        var {dy} = this;

        this.run('/item/set', {
            id: item.id,
            height: px (item.height + dy) 
        });            
    }    

    toTop (item) {
        var {dy} = this;
        
        this.run('/item/set', {
            id: item.id,
            height: px (item.height - dy) ,
            y: px (item.y + dy)
        });            
    }    
    
    moveXY (item) {
        var {dx, dy} = this;
        
        this.run('/item/set', {
            id: item.id,
            x: px (item.x + dx) ,
            y: px (item.y + dy)
        });
    }

    rotate (item) {
        var {angle} = this; 

        var {rotate} =item;

        if (typeof rotate == 'undefined') rotate = 0; 

        this.run('/item/set', {
            id: item.id, 
            rotate: (rotate + Math.floor(angle) - 270)
        });
    }

    resizeComponent () {
        var items = this.rectItems;
        var event = CHANGE_LAYER_SIZE;

        if (this.currentType == SEGMENT_TYPE_TOP) {
            items.forEach(item => { this.toTop(item) })
        } else if (this.currentType == SEGMENT_TYPE_BOTTOM) {
            items.forEach(item => { this.toBottom(item) })
        } else if (this.currentType == SEGMENT_TYPE_RIGHT) {
            items.forEach(item => { this.toRight(item) })
        } else if (this.currentType == SEGMENT_TYPE_LEFT) {
            items.forEach(item => { this.toLeft(item) })
        } else if (this.currentType == SEGMENT_TYPE_BOTTOM_LEFT) {
            items.forEach(item => { this.toBottom(item) })
            items.forEach(item => { this.toLeft(item) })
        } else if (this.currentType == SEGMENT_TYPE_BOTTOM_RIGHT) {
            items.forEach(item => { this.toBottom(item) })
            items.forEach(item => { this.toRight(item) })
        } else if (this.currentType == SEGMENT_TYPE_TOP_RIGHT) {
            items.forEach(item => { this.toTop(item) })
            items.forEach(item => { this.toRight(item) })
        } else if (this.currentType == SEGMENT_TYPE_TOP_LEFT) {
            items.forEach(item => { this.toTop(item) })
            items.forEach(item => { this.toLeft(item) })
        } else if (this.currentType == SEGMENT_TYPE_MOVE) {
            items.forEach(item => { this.moveXY(item) })
        } else if (this.currentType == SEGMENT_TYPE_ROTATE) {
            items.forEach(item => { this.rotate(item) })      
            event = CHANGE_LAYER_ROTATE 
        }

        this.updatePosition(items)        
        this.emit(event)               
    }


    /* drag  */

    isNotDownCheck () {
        return !this.xy;
    }

    isDownCheck () {
        return this.xy; 
    }

    'pointerstart $el [data-value] | isNotDownCheck' (e) {
        e.stopPropagation();
        this.activeButton = e.$delegateTarget;
        this.activeButton.addClass('active');
        var type = e.$delegateTarget.attr('data-value');
        this.currentType = type; 
        var layerId = e.$delegateTarget.parent().attr('predefined-layer-id')
        this.$dom = this.read('/item/dom', layerId);
        this.$selectLayer = this.read('/item/get', layerId);

        if (this.$dom) {
            var rect = this.$dom.rect()
            this.layerX = parseParamNumber(this.$selectLayer.x);
            this.layerY = parseParamNumber(this.$selectLayer.y);
            this.layerCenterX = rect.left + rect.width/2;
            this.layerCenterY = rect.top + rect.height/2;
        }
        this.xy = e.xy;
        this.rectItems = this.read('/selection/current').map(it => {
            return {
                id: it.id,
                x: parseParamNumber(it.x),
                y: parseParamNumber(it.y),
                width: parseParamNumber(it.width),
                height: parseParamNumber(it.height),
                rotate: parseParamNumber(it.rotate || 0)
            }
        })

        this.boardOffset = this.$board.offset()
        this.pageOffset = this.$page.offset()
        this.canvasScrollLeft = this.$board.scrollLeft();
        this.canvasScrollTop = this.$board.scrollTop();        
    }

    'pointermove document | debounce(10) | isDownCheck' (e) {
        this.targetXY = e.xy; 

        this.dx = e.xy.x - this.xy.x;
        this.dy = e.xy.y - this.xy.y;

        if (this.currentType == 'rotate') {
            this.angle = caculateAngle (e.xy.x - this.layerCenterX,  e.xy.y - this.layerCenterY);
        }

        if (this.read('/tool/get', 'snap.grid')) {

            if (this.currentType == 'move') {
                var moveX = this.layerX + this.dx
                var moveY = this.layerY + this.dy
        
                var tempX = moveX - moveX % SNAP_GRID
                var tempY = moveY - moveY % SNAP_GRID
        
                // console.log({tempX, tempY})
        
                this.dx = Math.floor( tempX / SNAP_GRID) * SNAP_GRID - this.layerX; 
                this.dy = Math.floor( tempY / SNAP_GRID) * SNAP_GRID - this.layerY; 

                // console.log('dy', this.dx, 'dx', this.dy)                
            }

        }

        this.resizeComponent();
    }

    isMoved (e) {
        if (!this.xy) return false;
        return this.xy.x != e.xy.x || this.xy.y != e.xy.y; 
    }

    'pointerend document | isDownCheck' (e) {
        this.currentType = null; 
        this.xy = null 
        this.moveX = null;
        this.moveY = null; 
        this.rectItems = null
        this.currentId = null; 

        this.dispatch('/history/push', 'Resize a layer');
    }

    'resize window | debounce(300)' (e) {
        this.refresh();
    }
}