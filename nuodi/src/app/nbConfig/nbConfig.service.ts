import { NbConfig } from './nbConfig.model';
import { Response } from './response.model';
import { Subject } from 'rxjs/Subject';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { UIService } from '../shared/ui.service';
import {NbFile} from './nbFile.model';

import 'rxjs/add/operator/toPromise';
import { FileInput } from 'ngx-material-file-input';

@Injectable()
export class NbConfigService {
    token: string;
    reChanged = new Subject<NbConfig[]>();
    nbConfigs: NbConfig[] = [];
    private nbConfig: NbConfig

    constructor(
        private http: HttpClient,
        private uiService: UIService
    ) {}

    ngOnInit() {
    }

    getAllNbConfigs() {
        this.token = localStorage.getItem('accessToken');
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':'application/json',
                'Access-Control-Allow-Origin':"*",
                'Authorization':`Bearer ${this.token}`
            })
        };
        this.http.post<Response>(
            `http://192.168.2.177:3002/rest/config/get`,
            {device_id: "ab111"},
            httpOptions
        ).toPromise()
        .then((results: Response) => {
            console.log(results);
            this.reChanged.next(results.result);
            this.nbConfigs = results.result;
        })
        .catch(error => {
        })

    }

    newNbConfig(nbConfigData: NbFile) {
        this.token = localStorage.getItem('accessToken');
        var data = new FormData();
        data.append("file", nbConfigData.file);
        data.append("device_id", nbConfigData.nbConfig.device_id);
        data.append("device_name", nbConfigData.nbConfig.device_name);
        this.uiService.loadingStateChanged.next(true);
        const httpOptions = {
            headers: new HttpHeaders({
                // 'Content-Type':'multipart/form-data',
                'Access-Control-Allow-Origin':"*",
                'Authorization':`Bearer ${this.token}`
            })
        };
        this.http.post(
            `http://192.168.2.177:3002/rest/config/uploadFile`,
            data,
            httpOptions
        ).toPromise()
        .then(result => {
            this.uiService.loadingStateChanged.next(false);
            this.uiService.showSnackbar("NbConfig Done",null,5000)
            this.getAllNbConfigs()
        })
        .catch(error => {
            this.uiService.loadingStateChanged.next(false);
            this.uiService.showSnackbar(error.error.errors[0].detail,null,3000)
        })

    }

    cancelNbConfig() {

    }
}