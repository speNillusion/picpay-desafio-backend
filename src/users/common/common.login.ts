/* 
    1° create a func to make login:
       -> func login(@Header('Authorization') token: string, @Res() res: Response): 
                --> that function will receive the token from the header,
                ---> and will verify if the token is valid, verifying if email and pass r valids to login,
                ---> if the token is invalid, the function will return a response with the status code 401,
                ---> if the token is valid, the function will return a response with the status code 200;
                --> if 200, the function will return the balance of the user;
*/