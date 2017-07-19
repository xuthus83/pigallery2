import {expect} from "chai";
import {AuthenticationMWs} from "../../../../../backend/middlewares/user/AuthenticationMWs";
import {ErrorCodes, ErrorDTO} from "../../../../../common/entities/Error";
import {UserDTO, UserRoles} from "../../../../../common/entities/UserDTO";
import {ObjectManagerRepository} from "../../../../../backend/model/ObjectManagerRepository";
import {UserManager} from "../../../../../backend/model/memory/UserManager";
import {Config} from "../../../../../common/config/private/Config";


describe('Authentication middleware', () => {

  beforeEach(() => {
    ObjectManagerRepository.reset();
  });

  describe('authenticate', () => {
    it('should call next on authenticated', (done) => {
      let req: any = {
        session: {
          user: "A user"
        },
        sessionOptions: {},
        query: {},
        params: {}
      };
      let next: any = (err) => {
        expect(err).to.be.undefined;
        done();
      };
      AuthenticationMWs.authenticate(req, null, next);

    });

    it('should call next with error on not authenticated', (done) => {
      let req: any = {
        session: {},
        sessionOptions: {},
        query: {},
        params: {}
      };
      Config.Client.authenticationRequired = true;
      let res: any = {};
      let next: any = (err: ErrorDTO) => {
        expect(err).not.to.be.undefined;
        expect(err.code).to.be.eql(ErrorCodes.NOT_AUTHENTICATED);
        done();
      };
      AuthenticationMWs.authenticate(req, null, next);

    });
  });

  describe('inverseAuthenticate', () => {

    it('should call next with error on authenticated', (done) => {
      let req: any = {
        session: {},
        sessionOptions: {},
      };
      let res: any = {};
      let next: any = (err) => {
        expect(err).to.be.undefined;
        done();
      };
      AuthenticationMWs.inverseAuthenticate(req, null, next);

    });


    it('should call next error on authenticated', (done) => {
      let req: any = {
        session: {
          user: "A user"
        },
        sessionOptions: {},
      };
      let res: any = {};
      let next: any = (err: ErrorDTO) => {
        expect(err).not.to.be.undefined;
        expect(err.code).to.be.eql(ErrorCodes.ALREADY_AUTHENTICATED);
        done();
      };
      AuthenticationMWs.inverseAuthenticate(req, null, next);

    });
  });

  describe('authorise', () => {
    it('should call next on authorised', (done) => {
      let req: any = {
        session: {
          user: {
            role: UserRoles.LimitedGuest
          }
        },
        sessionOptions: {}
      };
      let next: any = (err) => {
        expect(err).to.be.undefined;
        done();
      };
      AuthenticationMWs.authorise(UserRoles.LimitedGuest)(req, null, next);

    });

    it('should call next with error on not authorised', (done) => {
      let req: any = {
        session: {
          user: {
            role: UserRoles.LimitedGuest
          }
        },
        sessionOptions: {}
      };
      let next: any = (err: ErrorDTO) => {
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

    describe('should call input ErrorDTO next on missing...', () => {
      it('body', (done) => {
        let req: any = {
          query: {},
          params: {}
        };
        let next: any = (err: ErrorDTO) => {
          expect(err).not.to.be.undefined;
          expect(err.code).to.be.eql(ErrorCodes.INPUT_ERROR);
          done();
        };
        AuthenticationMWs.login(req, null, next);

      });

      it('loginCredential', (done) => {
        let req: any = {
          body: {},
          query: {},
          params: {}
        };
        let next: any = (err: ErrorDTO) => {
          expect(err).not.to.be.undefined;
          expect(err.code).to.be.eql(ErrorCodes.INPUT_ERROR);
          done();
        };
        AuthenticationMWs.login(req, null, next);


      });


      it('loginCredential content', (done) => {
        let req: any = {
          body: {loginCredential: {}},
          query: {},
          params: {}
        };
        let next: any = (err: ErrorDTO) => {
          expect(err).not.to.be.undefined;
          expect(err.code).to.be.eql(ErrorCodes.INPUT_ERROR);
          done();
        };
        AuthenticationMWs.login(req, null, next);


      });

    });
    it('should call next with error on not finding user', (done) => {
      let req: any = {
        body: {
          loginCredential: {
            username: "aa",
            password: "bb"
          }
        },
        query: {},
        params: {}
      };
      let next: any = (err: ErrorDTO) => {
        expect(err).not.to.be.undefined;
        expect(err.code).to.be.eql(ErrorCodes.CREDENTIAL_NOT_FOUND);
        done();
      };
      ObjectManagerRepository.getInstance().UserManager = <UserManager>{
        findOne: (filter): Promise<UserDTO> => {
          return Promise.reject(null);
        }
      };
      AuthenticationMWs.login(req, null, next);


    });

    it('should call next with user on the session on  finding user', (done) => {
      let req: any = {
        session: {},
        body: {
          loginCredential: {
            username: "aa",
            password: "bb"
          }
        },
        query: {},
        params: {}
      };
      let next: any = (err: ErrorDTO) => {
        expect(err).to.be.undefined;
        expect(req.session.user).to.be.eql("test user");
        done();
      };
      ObjectManagerRepository.getInstance().UserManager = <UserManager>{
        findOne: (filter) => {
          return Promise.resolve("test user");
        }
      };
      AuthenticationMWs.login(req, null, next);


    });
  });


  describe('logout', () => {
    it('should call next on logout', (done) => {
      let req: any = {
        session: {
          user: {
            role: UserRoles.LimitedGuest
          }
        }
      };
      let next: any = (err) => {
        expect(err).to.be.undefined;
        expect(req.session.user).to.be.undefined;
        done();
      };
      AuthenticationMWs.logout(req, null, next);

    });

  });

});
