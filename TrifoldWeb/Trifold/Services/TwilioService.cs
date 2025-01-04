using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Twilio;
using Twilio.Rest.Api.V2010.Account;

namespace Trifold.Services
{
    public class TwilioService : ITwilioService
    {
        private readonly IConfiguration configuration;
        private readonly ILogger<SendGridService> logger;
        private readonly string apiKey;
        private readonly string apiSecret;
        private readonly string smsPhone;

        public TwilioService(IConfiguration configuration, ILogger<SendGridService> logger)
        {
            this.configuration = configuration;
            this.logger = logger;
            this.apiKey = this.configuration["TwilioApiKey"];
            this.apiSecret = this.configuration["TwilioApiSecret"];
            this.smsPhone = this.configuration["SmsPhoneNumber"];
        }

        public bool SendSMS(string phoneNumber, string message)
        {
            TwilioClient.Init(apiKey, apiSecret);
            var sms = MessageResource.Create(
                to: new Twilio.Types.PhoneNumber(phoneNumber),
                from: new Twilio.Types.PhoneNumber(smsPhone),
                body: message);

            if (sms.Status == MessageResource.StatusEnum.Failed || sms.Status == MessageResource.StatusEnum.Undelivered)
            {
                logger.LogWarning("Error sending SMS through Twilio. Error: {error}", sms.ErrorMessage);
                return false;
            }

            return true;
        }


    }
}
