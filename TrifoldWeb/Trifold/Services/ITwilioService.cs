namespace Trifold.Services
{
    public interface ITwilioService
    {
        bool SendSMS(string phoneNumber, string message);
    }
}