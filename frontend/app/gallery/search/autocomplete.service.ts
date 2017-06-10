import {Injectable} from "@angular/core";
import {NetworkService} from "../../model/network/network.service";
import {AutoCompleteItem} from "../../../../common/entities/AutoCompleteItem";
import {Message} from "../../../../common/entities/Message";

@Injectable()
export class AutoCompleteService {


  constructor(private _networkService: NetworkService) {
  }

  public autoComplete(text: string): Promise<Message<Array<AutoCompleteItem>>> {
    return this._networkService.getJson("/autocomplete/" + text);
  }


}
