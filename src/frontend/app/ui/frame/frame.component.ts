import {Component, ElementRef, HostListener, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthenticationService} from '../../model/network/authentication.service';
import {UserDTO, UserRoles} from '../../../../common/entities/UserDTO';
import {Config} from '../../../../common/config/public/Config';
import {BehaviorSubject} from 'rxjs';
import {NotificationService} from '../../model/notification.service';
import {QueryService} from '../../model/query.service';
import {NavigationLinkTypes} from '../../../../common/config/public/ClientConfig';
import {SearchQueryDTO} from '../../../../common/entities/SearchQueryDTO';
import {Utils} from '../../../../common/Utils';
import {PageHelper} from '../../model/page.helper';
import {BsDropdownDirective} from 'ngx-bootstrap/dropdown';
import {LanguageComponent} from '../language/language.component';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.css'],
  providers: [RouterLink],
  encapsulation: ViewEncapsulation.Emulated,
})
export class FrameComponent {
  @Input() showSearch = false;
  @Input() showShare = false;
  public readonly user: BehaviorSubject<UserDTO>;
  public readonly authenticationRequired = Config.Users.authenticationRequired;
  public readonly title = Config.Server.applicationTitle;
  public collapsed = true;
  public readonly navbarLinks = Config.Gallery.NavBar.links;
  public readonly NavigationLinkTypes = NavigationLinkTypes;
  public readonly stringify = JSON.stringify;

  /* sticky top navbar */
  private lastScroll = 0;
  public shouldHideNavbar = false;
  public navbarKeepTop = true;
  public  animateNavbar = false;
  @ViewChild('navContainer', {static: true}) navContainer: ElementRef;
  @ViewChild('dropdown', {static: true}) dropdown: BsDropdownDirective;
  @ViewChild('languageSelector', {static: true}) languageSelector: LanguageComponent;

  constructor(
    private authService: AuthenticationService,
    public notificationService: NotificationService,
    public queryService: QueryService,
    private router: Router
  ) {
    this.user = this.authService.user;
  }

  isAdmin(): boolean {
    return this.user.value && this.user.value.role >= UserRoles.Admin;
  }

  isFacesAvailable(): boolean {
    return (
      Config.Faces.enabled &&
      this.user.value &&
      this.user.value.role >= Config.Faces.readAccessMinRole
    );
  }

  isLinkActive(url: string): boolean {
    return this.router.url.startsWith(url);
  }

  isSearchActive(searchQuery: SearchQueryDTO): boolean {
    if (!this.router.url.startsWith('/search')) {
      return false;
    }
    try {
      const rawUrl = this.router.url.substring('/search/'.length);
      const sq = JSON.parse(decodeURIComponent(rawUrl)) as SearchQueryDTO;
      return sq.type == searchQuery.type && Utils.equalsFilter(sq, searchQuery);
    } catch (e) {
      // ignored
    }
    return false;
  }

  logout(): void {
    this.authService.logout();
  }

  isAlbumsAvailable(): boolean {
    return Config.Album.enabled;
  }



  @HostListener('window:scroll')
  onScroll(): void {
    const up = this.lastScroll > PageHelper.ScrollY;
    const down = this.lastScroll < PageHelper.ScrollY;
    //we are the top where the navbar by default lives
    if (this.navContainer.nativeElement.offsetHeight > PageHelper.ScrollY) {
      // do not force move navbar up when we are scrolling up from bottom
      if (this.shouldHideNavbar != false) {
        this.navbarKeepTop = true;
      }

    } else {
      // enable navigation once we left the top part to prevent hide extra animation
      this.animateNavbar = !(this.navbarKeepTop && down);
      this.navbarKeepTop = false;
      if (down) {
        this.dropdown.hide();
        this.languageSelector.dropdown.hide();
      }
    }

    if (up) { //scroll up
      this.shouldHideNavbar = false;
    } else if (down) { // scroll down
      this.shouldHideNavbar = true;
    }

    this.lastScroll = PageHelper.ScrollY;
  }
}

