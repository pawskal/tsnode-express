
import HttpClient from '../../../lib/httpClient';
import { Service } from '../../../lib';

@Service
class SearchService {
  constructor(private http: HttpClient){
  }

  index(){

  }

  get(){
    return this.http.get('http://5acdc99a23cb4e00148b8393.mockapi.io/events')
  }
}

export default SearchService;
