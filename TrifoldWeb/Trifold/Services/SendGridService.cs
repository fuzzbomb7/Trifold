using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Threading.Tasks;

namespace Trifold.Services
{
	public class SendGridService : ISendGridService
	{
		private readonly IConfiguration configuration;
		private readonly ILogger<SendGridService> logger;
		private readonly string apiKey;

		public SendGridService(IConfiguration configuration, ILogger<SendGridService> logger)
		{
			this.configuration = configuration;
			this.logger = logger;
			this.apiKey = this.configuration["SendGridApiKey"];
		}

		public async Task SendEmailAsync(string toAddress, string subject, string textContent, string htmlContent = null, string fromAddress = "help@trifold.app")
		{
			var client = new SendGridClient(apiKey);
			var from = new EmailAddress(fromAddress);
#if DEBUG
			toAddress = "andrew@trifold.app";
#endif
			var to = new EmailAddress(toAddress);
			var msg = MailHelper.CreateSingleEmail(from, to, subject, textContent, htmlContent);
			var response = await client.SendEmailAsync(msg);

			if (response.StatusCode != System.Net.HttpStatusCode.Accepted)
			{
				var getResponse = await response.Body.ReadAsStringAsync();
				logger.LogWarning("Error sending email through Sendgrid. Response: {getResponse}", getResponse);
			}
		}

		public async Task SendTemplateEmailAsync(string toAddress, string templateId, object templateData, string fromAddress = "help@trifold.app")
		{
			var client = new SendGridClient(apiKey);
			var from = new EmailAddress(fromAddress);
#if DEBUG
			toAddress = "andrew@trifold.app";
#endif
			var to = new EmailAddress(toAddress);
			var msg = MailHelper.CreateSingleTemplateEmail(from, to, templateId, templateData);
			var response = await client.SendEmailAsync(msg);

			if (response.StatusCode != System.Net.HttpStatusCode.OK)
			{
				var getResponse = await response.Body.ReadAsStringAsync();
				logger.LogWarning("Error sending email through Sendgrid. Response: {getResponse}", getResponse);
			}
		}

		public async Task SendNewUserEmailAsync(string userName, string password)
		{
			string message = "An account has been created for you in the Trifold event portal. Use the event portal to upload and configure event data for your mobile app(s)." +
				"\r\n\r\n" + "https://www.trifold.app/login" + "\r\n\r\n" + $"User: {userName}" + "\r\n" + $"Pass: {password}";
			await SendEmailAsync(userName, "Trifold | Event Portal Login", message);
			return;
		}

		public async Task SendPasswordResetEmailAsync(string email, string resetUrl)
		{
			string message = "To reset and change your password, please visit this link:" +
				"\r\n\r\n" + $"{resetUrl}";
			await SendEmailAsync(email, "Trifold | Reset Password", message);
			return;
		}

		public async Task SendCsvCompletionEmailAsync(string email, int eventId, int fileId)
		{
			string message = "Your CSV file upload has completed. Please view the upload log for any errors, and carefully review the beverage list against your official event beverage list for accuracy:" +
				"\r\n\r\n" + $"https://www.trifold.app/{eventId}/Beer/ImportLog/{fileId}";
			await SendEmailAsync(email, "Trifold | CSV Upload Complete", message);
			return;
		}

		public async Task AddToEmailListAsync(string email)
		{
			var client = new SendGridClient(apiKey);
			string requestBody = JsonConvert.SerializeObject(new { email });

			// Request needs to be an array, so slap some brackets around that fucker!
			requestBody = string.Concat("[", requestBody, "]");
			Response addRecipient = await client.RequestAsync(SendGridClient.Method.POST, requestBody: requestBody, urlPath: "/contactdb/recipients");

			if (addRecipient.StatusCode != System.Net.HttpStatusCode.Created)
			{
				var getResponse = await addRecipient.Body.ReadAsStringAsync();
				logger.LogWarning("Error adding recipient to Sendgrid marketing campaigns. {error}", getResponse);
			}
		}

	}
}
