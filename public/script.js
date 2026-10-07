const ticketForm = document.getElementById('ticketForm');
const formStatus = document.getElementById('formStatus');
const ticketList = document.getElementById('ticketList');

async function loadTickets() {
  if (!ticketList) return;

  try {
    const response = await fetch('/api/tickets');
    const tickets = await response.json();

    if (!Array.isArray(tickets) || tickets.length === 0) {
      ticketList.innerHTML = '<p class="empty-state">No tickets yet. Submit the first support request.</p>';
      return;
    }

    ticketList.innerHTML = tickets
      .slice(0, 6)
      .map(
        (ticket) => `
          <article class="ticket-item">
            <h3>${ticket.title}</h3>
            <p class="ticket-meta">
              <strong>Customer:</strong> ${ticket.customerName}<br>
              <strong>Category:</strong> ${ticket.category}<br>
              <strong>Priority:</strong> ${ticket.priority}
            </p>
            <span class="ticket-badge">${ticket.status}</span>
          </article>
        `
      )
      .join('');
  } catch (error) {
    ticketList.innerHTML = '<p class="empty-state">Unable to load tickets right now.</p>';
  }
}

if (ticketForm) {
  ticketForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(ticketForm);
    const payload = Object.fromEntries(formData.entries());

    formStatus.textContent = 'Submitting ticket...';

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ticket submission failed');
      }

      formStatus.textContent = result.message || 'Ticket submitted successfully!';
      ticketForm.reset();
      await loadTickets();
    } catch (error) {
      formStatus.textContent = error.message || 'Something went wrong. Please try again.';
    }
  });
}

loadTickets();
