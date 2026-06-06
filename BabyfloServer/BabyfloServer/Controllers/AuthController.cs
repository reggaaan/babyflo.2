using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BabyfloServer.Data;

namespace BabyfloServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DataContext _context;

        public AuthController(DataContext context)
        {
            _context = context;
        }

        // REGISTER API
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User userDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == userDto.Email.ToLower()))
            {
                return BadRequest(new { message = "Email is already registered!" });
            }

            userDto.Email = userDto.Email.ToLower();
            _context.Users.Add(userDto);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful!" });
        }

        // LOGIN API
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email.ToLower());

            if (user == null || user.Password != loginDto.Password)
            {
                return BadRequest(new { message = "Invalid email or password." });
            }

            return Ok(new { message = $"Welcome back, {user.Name}!" });
        }
    }
}