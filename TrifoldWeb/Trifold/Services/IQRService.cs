namespace Trifold.Services
{
    public interface IQRService
    {
        string GenerateQRCode(string url, int eventId);
    }
}