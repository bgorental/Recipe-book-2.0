export class User{
    constructor(public email: string, public id: string, private _token: string, private _tokenExpiration: Date){}

    get token(){
        if(!this._tokenExpiration || new Date() > this._tokenExpiration){
            // if there is no token or it is expired then it is waste so here we are writing null.
            return null;
        }
        //if token is valid
        return this._token;
    }
}