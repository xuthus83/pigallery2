import {expect} from "chai";
import {AuthenticationMWs} from "../../../../../backend/middlewares/user/AuthenticationMWs";
import {Error, ErrorCodes} from "../../../../../common/entities/Error";
import {UserRoles} from "../../../../../common/entities/User";
import {ObjectManagerRepository} from "../../../../../backend/model/ObjectManagerRepository";
import {UserManager} from "../../../../../backend/model/memory/UserManager";


describe('Authentication middleware', () => {

    beforeEach(() => {
        ObjectManagerRepository.reset();
    });

    describe('authenticate', () => {
        it('should call next on authenticated', (done) => {
            let req:any = {
                session: {
                    user: "A user"
                }
            };
            let next:any = (err) => {
                expect(err).to.be.undefined;
                done();
            };
            AuthenticationMWs.authenticate(req, null, next);

        });

        it('should call next with error on not authenticated', (done) => {
            let req:any = {
                session: {}
            };
            let res:any = {};
            let next:any = (err:Error) => {
                expect(err).not.to.be.undefined;
                expect(err.code).to.be.eql(ErrorCodes.NOT_AUTHENTICATED);
                done();
            };
            AuthenticationMWs.authenticate(req, null, next);

        });
    });

    describe('inverseAuthenticate', () => {

        it('should call next with error on authenticated', (done) => {
            let req:any = {
                session: {}
            };
            let res:any = {};
            let next:any = (err) => {
                expect(err).to.be.undefined;
                done();
            };
            AuthenticationMWs.inverseAuthenticate(req, null, next);

        });


        it('should call next error on authenticated', (done) => {
            let req:any = {
                session: {
                    user: "A user"
                }
            };
            let res:any = {};
            let next:any = (err:Error) => {
                expect(err).not.to.be.undefined;
                expect(err.code).to.be.eql(ErrorCodes.ALREADY_AUTHENTICATED);
                done();
            };
            AuthenticationMWs.inverseAuthenticate(req, null, next);

        });
    });

    describe('authorise', () => {
        it('should call next on authorised', (done) => {
            let req:any = {
                session: {
                    user: {
                        role: UserRoles.Guest
                    }
                }
            };
            let next:any = (err) => {
                expect(err).to.be.undefined;
                done();
            };
            AuthenticationMWs.authorise(UserRoles.Guest)(req, null, next);

        });

        it('should call next with error on not authorised', (done) => {
            let req:any = {
                session: {
                    user: {
                        role: UserRoles.Guest
                    }
                }
            };
            let next:any = (err:Error) => {
                expect(err).not.to.be.undefined;
                expect(err.code).to.be.eql(ErrorCodes.NOT_AUTHORISED);
                done();
            };
            AuthenticationMWs.authorise(UserRoles.Developer)(req, null, next);

        });
    });

    describe('login', () => {
        beforeEach(() => {
            ObjectManagerRepository.reset();
        });

        describe('should call next on missing...', () => {
            it('body', (done) => {
                let req:any = {};
                let next:any = (err) => {
                    expect(err).to.be.undefined;
                    done();
                };
                AuthenticationMWs.login(req, null, next);

            });

            it('loginCredential', (done) => {
                let req:any = {
                    body: {}
                };
                let next:any = (err) => {
                    expect(err).to.be.undefined;
                    done();
                };
                AuthenticationMWs.login(req, null, next);


            });


            it('loginCredential content', (done) => {
                let req:any = {
                    body: {loginCredential: {}}
                };
                let next:any = (err) => {
                    expect(err).to.be.undefined;
                    done();
                };
                AuthenticationMWs.login(req, null, next);


            });

        });
        it('should call next with error on not finding user', (done) => {
            let req:any = {
                body: {
                    loginCredential: {
                        username: "aa",
                        password: "bb"
                    }
                }
            };
            let next:any = (err:Error) => {
                expect(err).not.to.be.undefined;
                expect(err.code).to.be.eql(ErrorCodes.CREDENTIAL_NOT_FOUND);
                done();
            };
            ObjectManagerRepository.getInstance().setUserManager(<UserManager>{
                findOne: (filter, cb) => {
                    cb(null, null);
                }
            });
            AuthenticationMWs.login(req, null, next);


        });

        it('should call next with user on the session on  finding user', (done) => {
            let req:any = {
                session: {},
                body: {
                    loginCredential: {
                        username: "aa",
                        password: "bb"
                    }
                }
            };
            let next:any = (err:Error) => {
                expect(err).to.be.undefined;
                expect(req.session.user).to.be.eql("test user");
                done();
            };
            ObjectManagerRepository.getInstance().setUserManager(<UserManager>{
                findOne: (filter, cb:any) => {
                    cb(null, "test user");
                }
            });
            AuthenticationMWs.login(req, null, next);


        });
    });


    describe('logout', () => {
        it('should call next on logout', (done) => {
            let req:any = {
                session: {
                    user: {
                        role: UserRoles.Guest
                    }
                }
            };
            let next:any = (err) => {
                expect(err).to.be.undefined;
                expect(req.session.user).to.be.undefined;
                done();
            };
            AuthenticationMWs.logout(req, null, next);

        });

    });

});
