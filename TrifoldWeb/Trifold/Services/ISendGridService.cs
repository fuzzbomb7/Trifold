using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trifold.Services
{
	public interface ISendGridService
	{
		Task SendNewUserEmailAsync(string userName, string password);
		Task SendPasswordResetEmailAsync(string email, string resetUrl);
		Task SendCsvCompletionEmailAsync(string email, int eventId, int fileId);
		Task AddToEmailListAsync(string email);
		Task SendEmailAsync(string toAddress, string subject, string textContent, string htmlContent = null, string fromAddress = "help@trifold.app");
		Task SendTemplateEmailAsync(string toAddress, string templateId, object templateData, string fromAddress = "help@trifold.app");
	}
}
