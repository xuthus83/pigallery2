import {Injectable} from "@angular/core";
import {Event} from "../../../common/event/Event";

@Injectable()
export class OverlayService {

    OnOverlayChange = new Event<boolean>();
    private scrollWidth: number = null;

    public showOverlay() {

        //disable scrolling
        document.getElementsByTagName('body')[0].style.overflow = 'hidden';
        this.OnOverlayChange.trigger(true);
    }

    public hideOverlay() {

        document.getElementsByTagName('body')[0].style.overflowY = 'scroll';
        this.OnOverlayChange.trigger(false);
    }

    getScrollbarWidth() {
        if (this.scrollWidth == null) {


            let outer = document.createElement("div");
            outer.style.visibility = "hidden";
            outer.style.width = "100px";
            outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

            document.body.appendChild(outer);

            let widthNoScroll = outer.offsetWidth;
            // force scrollbars
            outer.style.overflow = "scroll";

            // add innerdiv
            let inner = document.createElement("div");
            inner.style.width = "100%";
            outer.appendChild(inner);

            let widthWithScroll = inner.offsetWidth;

            // remove divs
            outer.parentNode.removeChild(outer);
            this.scrollWidth = widthNoScroll - widthWithScroll;
        }

        return this.scrollWidth;
    }

    getPhantomScrollbarWidth() {
        if (document.getElementsByTagName('body')[0].style.overflow == 'hidden') {
            return this.getScrollbarWidth();
        }
        return 0;
    }

}
