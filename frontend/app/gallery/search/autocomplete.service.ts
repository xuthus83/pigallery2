import {Injectable} from "@angular/core";
import {NetworkService} from "../../model/network/network.service";
import {AutoCompleteItem} from "../../../../common/entities/AutoCompleteItem";

@Injectable()
export class AutoCompleteService {


  constructor(private _networkService: NetworkService) {
  }

  public autoComplete(text: string): Promise<Array<AutoCompleteItem>> {
    return this._networkService.getJson<Array<AutoCompleteItem>>("/autocomplete/" + text);
  }


}
