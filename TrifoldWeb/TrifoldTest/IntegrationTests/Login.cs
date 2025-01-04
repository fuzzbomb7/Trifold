using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace TrifoldTest.IntegrationTests
{
	public class Login
	{
		public void LoginAsTestUser(string nextPageTitle)
		{
			using (IWebDriver driver = new FirefoxDriver())
			{
				var email = driver.FindElement(By.Id("Email"));
				email.SendKeys("testuser@trifold.app");

				var pass = driver.FindElement(By.Id("Password"));
				pass.SendKeys("Changethi5%");

				var remember = driver.FindElement(By.Id("RememberMe"));
				remember.Click();

				email.Submit();

				var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
				wait.Until(x => x.Title == nextPageTitle);
			}
		}
	}
}
