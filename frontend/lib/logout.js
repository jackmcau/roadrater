// Simple logout handler: redirect to index with a query flag so index can show a message
document.addEventListener('DOMContentLoaded', () => {
	const links = document.querySelectorAll('.logout-link');
	links.forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			// Redirect to index and indicate logout via query param
			window.location.href = 'index.html?loggedOut=1';
		});
	});
});

