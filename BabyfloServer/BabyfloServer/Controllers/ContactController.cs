using Microsoft.AspNetCore.Mvc;
using BabyfloServer.Data;

namespace BabyfloServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly DataContext _context;

        public ContactController(DataContext context)
        {
            _context = context;
        }

        // CONTACT MESSAGE API
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitMessage([FromBody] ContactMessage msg)
        {
            _context.ContactMessages.Add(msg);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Your message has been saved to the database!" });
        }
    }
}