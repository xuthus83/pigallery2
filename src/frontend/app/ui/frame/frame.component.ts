import {Component, ViewEncapsulation} from '@angular/core';
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

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.css'],
  providers: [RouterLink],
  encapsulation: ViewEncapsulation.Emulated,
})
export class FrameComponent {
  public readonly user: BehaviorSubject<UserDTO>;
  public readonly authenticationRequired = Config.Users.authenticationRequired;
  public readonly title = Config.Server.applicationTitle;
  public collapsed = true;
  public readonly navbarLinks = Config.Gallery.NavBar.links;
  public readonly NavigationLinkTypes = NavigationLinkTypes;
  public readonly stringify = JSON.stringify;

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
}

