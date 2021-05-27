import serviceDesk from '../../../../../src/server-middleware/api/jira/service-desk';

import nock from 'nock';
import sinon from 'sinon';

const options = {
  origin: 'https://jira.example.org',
  username: 'example@europeana.eu',
  password: 'YOUR_TOKEN',
  serviceDesk: {
    serviceDeskId: '7',
    requestTypeId: '81'
  }
};
const middleware = serviceDesk(options);

const mockRequest = (body = {}) => ({ body });
const mockResponse = () => {
  const res = {};
  res.sendStatus = sinon.stub().returns(res);
  res.status = sinon.stub().returns(res);
  res.set = sinon.stub().returns(res);
  res.send = sinon.stub().returns(res);
  return res;
};
const mockJiraApiRequest = body => nock(options.origin).post('/rest/servicedeskapi/request', body);

describe('server-middleware/api/jira/service-desk', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('middleware', () => {
    describe('request handling', () => {
      it('sends a POST request to Jira service desk API', async() => {
        const req = mockRequest();
        const res = mockResponse();
        mockJiraApiRequest();

        await middleware(req, res);

        nock.isDone().should.be.true;
      });

      describe('Jira service desk API request POST body content', () => {
        it('includes serviceDeskId and requestTypeId from options', async() => {
          const req = mockRequest();
          const res = mockResponse();
          mockJiraApiRequest(body => (
            (body.serviceDeskId === options.serviceDesk.serviceDeskId) &&
            (body.requestTypeId === options.serviceDesk.requestTypeId)
          ));

          await middleware(req, res);

          nock.isDone().should.be.true;
        });

        it('uses full feedback for description field', async() => {
          const reqBody = {
            feedback: 'Hello there :)'
          };
          const req = mockRequest({ body: reqBody });
          const res = mockResponse();
          mockJiraApiRequest(body => body.description === reqBody.feedback);

          await middleware(req, res);

          nock.isDone().should.be.true;
        });

        it('truncates feedback to 50 characters in summary field', async() => {
          const feedback = 'One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten.';
          const summary = 'One, Two, Three, Four, Five, Six, Seven, Eight, Ni…';
          const reqBody = {
            feedback
          };
          const req = mockRequest({ body: reqBody });
          const res = mockResponse();
          mockJiraApiRequest(body => body.summary === summary);

          await middleware(req, res);

          nock.isDone().should.be.true;
        });

        it('omits raiseOnBehalfOf if no email', async() => {
          const reqBody = {
            summary: 'Hello there :)'
          };
          const req = mockRequest({ body: reqBody });
          const res = mockResponse();
          mockJiraApiRequest(body => !Object.keys(body).includes('raiseOnBehalfOf'));

          await middleware(req, res);

          nock.isDone().should.be.true;
        });

        it('includes raiseOnBehalfOf if email present', async() => {
          const reqBody = {
            summary: 'Hello there :)',
            email: 'human@example.org'
          };
          const req = mockRequest({ body: reqBody });
          const res = mockResponse();
          mockJiraApiRequest(body => body.raiseOnBehalfOf === reqBody.email);

          await middleware(req, res);

          nock.isDone().should.be.true;
        });
      });
    });

    describe('response construction', () => {
      it('responds with upstream status on success', async() => {
        const status = 201;
        const req = mockRequest();
        const res = mockResponse();
        mockJiraApiRequest().reply(status);

        await middleware(req, res);

        res.sendStatus.should.have.been.calledWith(status);
      });

      it('responds with upstream error on failure', async() => {
        const status = 400;
        const errorMessage = 'Summary is required.';
        const req = mockRequest();
        const res = mockResponse();
        mockJiraApiRequest().reply(status, { errorMessage });

        await middleware(req, res);

        res.status.should.have.been.calledWith(status);
        res.send.should.have.been.calledWith(errorMessage);
      });

      it('responds with 500 status on request failure', async() => {
        const status = 500;
        const errorMessage = 'Unknown error';
        const req = mockRequest();
        const res = mockResponse();
        mockJiraApiRequest().replyWithError(errorMessage);

        await middleware(req, res);

        res.status.should.have.been.calledWith(status);
        res.send.should.have.been.calledWith(errorMessage);
      });
    });
  });
});
