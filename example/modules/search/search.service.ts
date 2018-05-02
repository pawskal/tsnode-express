
import HttpClient from '../../../lib/httpClient';
import { Service } from '../../../lib';


@Service
class SearchService {
  constructor(private http: HttpClient){
    console.dir(this.http, 'HTTP');
  }

  index(){

  }

  get(){
    return this.http.request({host:'5acdc99a23cb4e00148b8393.mockapi.io', path: '/events', method: 'GET'})
  }
}

export default SearchService;
