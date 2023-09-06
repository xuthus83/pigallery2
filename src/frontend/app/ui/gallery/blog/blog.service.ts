import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {FileDTO} from '../../../../../common/entities/FileDTO';
import {Utils} from '../../../../../common/Utils';
import {ContentService} from '../content.service';
import {mergeMap, Observable, shareReplay} from 'rxjs';
import {MDFilesFilterPipe} from '../../../pipes/MDFilesFilterPipe';

@Injectable()
export class BlogService {
  cache: { [key: string]: Promise<string> | string } = {};
  public groupedMarkdowns: Observable<GroupedMarkdown[]>;

  constructor(private networkService: NetworkService,
              private galleryService: ContentService,
              private mdFilesFilterPipe: MDFilesFilterPipe) {

    this.groupedMarkdowns = this.galleryService.sortedFilteredContent.pipe(
      mergeMap(async content => {
        if (!content) {
          return [];
        }
        const dates = content.mediaGroups.map(g => g.date)
          .filter(d => !!d).map(d => d.getTime());

        const files = this.mdFilesFilterPipe.transform(content.metaFile)
          .map(f => this.splitMarkDown(f, dates));

        return (await Promise.all(files)).flat();
      }), shareReplay(1));
  }

  private async splitMarkDown(file: FileDTO, dates: number[]): Promise<GroupedMarkdown[]> {
    const markdown = await this.getMarkDown(file);

    if (dates.length == 0) {
      return [{
        text: markdown,
        file: file
      }];
    }

    dates.sort();

    const splitterRgx = new RegExp(/<!--\s*@pg-date:?\s*\d{4}-\d{1,2}-\d{1,2}\s*-->/, 'gi');
    const dateRgx = new RegExp(/\d{4}-\d{1,2}-\d{1,2}/);

    const ret: GroupedMarkdown[] = [];
    const matches = Array.from(markdown.matchAll(splitterRgx));

    if (matches.length == 0) {
      return [{
        text: markdown,
        file: file
      }];
    }

    const baseText = markdown.substring(0, matches[0].index).trim();
    // don't show empty
    if (baseText) {
      ret.push({
        text: baseText,
        file: file
      });
    }

    for (let i = 0; i < matches.length; ++i) {
      const matchedStr = matches[i][0];
      // get UTC midnight date
      const dateNum = Utils.makeUTCMidnight(new Date(matchedStr.match(dateRgx)[0])).getTime();

      let groupDate = dates.find((d, i) => i > dates.length - 1 ? false : dates[i + 1] > dateNum);   //dates are sorted

      // cant find the date. put to the last group (as it was later)
      if (groupDate === undefined) {
        groupDate = dates[dates.length - 1];
      }
      const text = (i + 1 >= matches.length ? markdown.substring(matches[i].index) : markdown.substring(matches[i].index, matches[i + 1].index)).trim();

      // don't show empty
      if (!text) {
        continue;
      }
      // if it would be in the same group. Concatenate it
      const sameGroup = ret.find(g => g.date == groupDate);
      if (sameGroup) {
        sameGroup.text += text;
        continue;
      }
      ret.push({
        date: groupDate,
        text: text,
        file: file
      });
    }

    ret.forEach(md => md.textShort = md.text.substring(0, 200));

    return ret;
  }

  public getMarkDown(file: FileDTO): Promise<string> {
    const filePath = Utils.concatUrls(
      file.directory.path,
      file.directory.name,
      file.name
    );
    if (!this.cache[filePath]) {
      this.cache[filePath] = this.networkService.getText(
        '/gallery/content/' + filePath
      );
      (this.cache[filePath] as Promise<string>).then((val: string) => {
        this.cache[filePath] = val;
      });
    }
    return Promise.resolve(this.cache[filePath]);
  }
}


export interface GroupedMarkdown {
  date?: number;
  text: string;
  textShort?: string;
  file: FileDTO;
}
